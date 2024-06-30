import type { TPostAssignments, TErrorHandler, TUserProfile, TPostWithRelations, TInferSelectPostLike, likesArray, TInferSelectPost, TInferSelectUserNoPass, TUserId } from '../types/types';
import { scanTheCache, scanPostCache } from '../database/cache/post.cache';
import { removeScoreCache, addToListWithScore, getListScore } from '../database/cache/index.cache'
import { deleteLikePost, findFirstLike, findFirstPost, findManyPostByUserId, findSuggestedPosts, insertLikePost, 
    insertPost } from '../database/queries/post.query';
import { findLimitedUsers } from '../database/queries/user.query';
import { ResourceNotFoundError } from '../libs/utils';
import ErrorHandler from '../libs/utils/errorHandler';
import { v2 as cloudinary } from 'cloudinary';
import shuffleArray from '../libs/utils/shuffleArray';
import { postEventEmitter } from '../events/post.event';
import { getMultipleFromHashCache } from '../database/cache/index.cache';
import { insertNotification } from '../database/queries/notification.query';

const combinePostCreator = (post : TInferSelectPost, user : TInferSelectUserNoPass, resultFor : 'return' | 'redis') => {
    const creator = Object.fromEntries(Object.entries(user).filter(([key, value]) => value !== null && key !== 'updatedAt'));
    const { id, text, image, createdAt, updatedAt } = post;

    if(resultFor === 'redis') return {id, text, image, userId : JSON.stringify(creator), createdAt, updatedAt};
    return {id, text, image, userId : {...creator}, createdAt, updatedAt}
}

export const createPostService = async (currentUser : TInferSelectUserNoPass, text : string, image : string | undefined) => {
    try {
        if(image) {
            const uploadedResponse = await cloudinary.uploader.upload(image);
            image = uploadedResponse.secure_url;
        }
        const createdPost : TInferSelectPost = await insertPost(currentUser.id, text, image);

        addToListWithScore(`suggest_post:${currentUser.id}`, 10, createdPost.id);
        postEventEmitter.emit('create-post');
        return combinePostCreator(createdPost, currentUser, 'return');
        
    } catch (err) {
        const error = err as TErrorHandler;
        throw new ErrorHandler(`An error occurred : ${error.message}`, error.statusCode);
    }
}

const fetchAndConvertCacheToObject = async (key : string) : Promise<Record<string, string>> => {
    const keysArray : string[] = await scanTheCache(key);
    const keyValuePairs = arrayToKeyValuePairs(keysArray);
    return keyValuePairs;
}

export const arrayToKeyValuePairs = (keysArray : string[]) : Record<string, string> => {
    const keyValuePairs : Record<string, string> = keysArray.reduce((accumulator, currentValue, currentIndex, array) => {
        if (currentIndex % 2 === 0) accumulator[currentValue] = array[currentIndex + 1];
        return accumulator;
    }, {} as Record<string, string>);

    return keyValuePairs;
}

const assignTrendingPostsToUsers = async (tradingPosts : TPostAssignments, users : TUserId[]) : Promise<Record<string, string[]>> => {
    const totalUsers : number = users.length;
    const postsId : string[] = Object.keys(tradingPosts);
    const userPostAssignments : Record<string, string[]> = {};

    for (const postId of postsId) {
        const userCount : number = +tradingPosts[postId]

        const shuffledUsers : TUserId[] = shuffleArray([...users]);
        const selectedUsers : Set<TUserId> = new Set<TUserProfile>();

        let i = 0;
        while (selectedUsers.size < userCount) {
            selectedUsers.add(shuffledUsers[i % totalUsers]);
            i++;
        }
        userPostAssignments[postId] = Array.from(selectedUsers).map(user => user.id);
    }
    return userPostAssignments;
}

export const getPostsService = async (currentUserId : string) : Promise<TPostWithRelations[]> => {
    try {
        let suggestedPosts : TPostWithRelations[] = [];

        const likedPostsUsers : Record<string, string> = await fetchAndConvertCacheToObject('posts_liked:*');
        const likedPosts : TPostWithRelations[] = await assignLikedPostsToUser(likedPostsUsers);

        const trendingPosts : Record<string, string> = await fetchAndConvertCacheToObject('suggest_post:*');
        // const userLimitCount = Object.entries(trendingPosts).map(([postId, quantity]) => +quantity).sort((a, b) => b - a).splice(0, 1);
        const users = await findLimitedUsers();

        const trendingPostAssignments : Record<string, string[]> = await assignTrendingPostsToUsers(trendingPosts, users);
        const postsForCurrentUser : string[] = Object.keys(trendingPostAssignments).filter(postId => 
            trendingPostAssignments[postId].includes(currentUserId)
        ).splice(0, 150);
        if(postsForCurrentUser.length !== 0) {
            const suggestedPostsCache : TPostWithRelations[] = await getMultipleFromHashCache('post', postsForCurrentUser);
            suggestedPosts = parsedPostsArray(suggestedPostsCache) as TPostWithRelations[];
            if(suggestedPostsCache.length == 0) suggestedPosts = await findSuggestedPosts(postsForCurrentUser);
        }

        const combinedPosts : TPostWithRelations[] = await mergeLikedAndTrendingPosts(likedPosts, suggestedPosts);
        return combinedPosts;
        
    } catch (err) {
        const error = err as TErrorHandler;
        throw new ErrorHandler(`An error occurred : ${error.message}`, error.statusCode);
    }
}

export const postLikeService = async (currentUserId : string, postId : string) => {
    try {
        const postDetails : TPostWithRelations = await findFirstPost(postId);
        if(!postDetails) throw new ResourceNotFoundError();

        const hasLiked : TInferSelectPostLike | undefined = await findFirstLike(currentUserId, postId);
        if(!hasLiked) {
            await Promise.all([
                await insertNotification(currentUserId, postDetails.userId, 'like'),
                await insertLikePost(currentUserId, postId)
            ]);

            addToListWithScore(`posts_liked:${currentUserId}`, 1, postDetails.userId);
            addToListWithScore(`suggest_post:${postDetails.userId}`, 3, postId);
            postEventEmitter.emit('updated-post', postId);

            return 'Post has been liked';
        }

        await deleteLikePost(currentUserId, postId);
        const likesArray : string[] = await getListScore(`posts_liked:${currentUserId}`);
        const likeObject = arrayToKeyValuePairs(likesArray);
        
        if(likeObject[postDetails.userId] === '0' || likeObject[postDetails.userId] === '1') {
            removeScoreCache(`posts_liked:${currentUserId}`, postDetails.userId);
        }else {
            addToListWithScore(`posts_liked:${currentUserId}`, -1, postDetails.userId);
        }

        addToListWithScore(`suggest_post:${postDetails.userId}`, -3, postId);
        postEventEmitter.emit('updated-post', postId);
        return 'Post has been disliked';
        
    } catch (err) {
        const error = err as TErrorHandler;
        throw new ErrorHandler(`An error occurred : ${error.message}`, error.statusCode);
    }
}

const assignLikedPostsToUser = async (usersId : TPostAssignments) : Promise<TPostWithRelations[]> => {
    const matchedPosts : TPostWithRelations[] = [];

    const usersArray : likesArray[] = Object.entries(usersId).map(([userId, likedCount]) => ({userId, likedCount : +likedCount}));
    usersArray.sort((a, b) => b.likedCount - a.likedCount);

    for (const { userId } of usersArray) {
        const cachedPosts = await scanPostCache(userId);
        
        const postPromise = cachedPosts.map(async post => {
            if (post.userId === userId) {
                return parsedPostsArray(cachedPosts) as TPostWithRelations[];
            } else {
                return await findManyPostByUserId(userId);
            }
        });
        const postsArrays = await Promise.all(postPromise);
        postsArrays.forEach(posts => matchedPosts.push(...posts.splice(0, 150)));
    }

    if(matchedPosts.length <= 0) return [];
    return matchedPosts as TPostWithRelations[];
}

const mergeLikedAndTrendingPosts = async (likedPosts : TPostWithRelations[], trendingPosts : TPostWithRelations[]) : 
Promise<TPostWithRelations[]> => {
    const postMap = new Map<string, TPostWithRelations>();
    [...likedPosts.splice(0, 150), ...trendingPosts.splice(0, 150)].forEach(post => {
        postMap.set(post.id, post);
    });

    const mergedPostsArray = Array.from(postMap.values());
    return mergedPostsArray 
}

const parsedPostsArray = (postsArray : Required<TPostWithRelations[]>) : unknown => {
    const matchedPosts = [];

    for (const post of postsArray) {
        const { id, text, image, userId, createdAt, updatedAt, user, comments, likes, tags } = post;
        const fixedResult = {
            id, text, image, userId, createdAt, updatedAt, user : JSON.parse(user as unknown as string), 
            comments : comments ? JSON.parse(comments as unknown as string) : [], 
            likes : likes ? Object.keys(JSON.parse(likes as unknown as string)).length : [], tags
        }
        matchedPosts.push(fixedResult);
    }
    return matchedPosts;
}