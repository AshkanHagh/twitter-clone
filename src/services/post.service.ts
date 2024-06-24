import type { TPostAssignments, TErrorHandler, TUserProfile, TPostWithUser, TInferSelectPostLike, likesArray } from '../@types';
import { scanTheCache, incrementCacheScore } from '../database/cache/post.cache';
import { findFirstLike, findFirstPost, findManyPostByUserId, findSuggestedPosts, insertPost } from '../database/queries/post.query';
import { findLimitedUsers } from '../database/queries/user.query';
import { ResourceNotFoundError } from '../libs/utils';
import ErrorHandler from '../libs/utils/errorHandler';

export const createPostService = async (currentUserId : string, text : string, image : string | undefined) => {
    try {
        const createdPost = await insertPost(currentUserId, text, image);
        incrementCacheScore(`post:${currentUserId}:suggest`, 50, createdPost.id);
        return createdPost;
        
    } catch (err) {
        const error = err as TErrorHandler;
        throw new ErrorHandler(`An error occurred : ${error.message}`, error.statusCode);
    }
}

const convertArrayToObject = async (key : string) : Promise<Record<string, string>> => {
    const keysArray : string[] = await scanTheCache(key);
    const keyValuePairs : Record<string, string> = keysArray.reduce((accumulator, currentValue, currentIndex, array) => {
        if (currentIndex % 2 === 0) accumulator[currentValue] = array[currentIndex + 1];
        return accumulator;
    }, {} as Record<string, string>);

    return keyValuePairs;
}

const shuffleArray = <T>(array : T[]) : T[] => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

const assignPostsToUsers = async (tradingPosts : TPostAssignments, users : TUserProfile[]) : Promise<Record<string, string[]>> => {
    const totalUsers : number = users.length;
    const postsId : string[] = Object.keys(tradingPosts);
    const userPostAssignments : Record<string, string[]> = {};

    for (const postId of postsId) {
        const userCount : number = +tradingPosts[postId]

        const shuffledUsers : TUserProfile[] = shuffleArray([...users]);
        const selectedUsers : Set<TUserProfile> = new Set<TUserProfile>();

        let i = 0;
        while (selectedUsers.size < userCount) {
            selectedUsers.add(shuffledUsers[i % totalUsers]);
            i++;
        }
        userPostAssignments[postId] = Array.from(selectedUsers).map(user => user.id);
    }
    return userPostAssignments;
}

export const getPostsService = async (currentUserId : string) : Promise<TPostWithUser[]> => {
    try {
        const likedPostsUsers : Record<string, string> = await convertArrayToObject('user:*:likes:authorsId');
        const likedPosts : TPostWithUser[] = await assignLikedPostsToUser(likedPostsUsers);

        const users : TUserProfile[] = await findLimitedUsers();
        const trendingPosts : Record<string, string> = await convertArrayToObject('post:*:suggest');

        const userPostAssignments : Record<string, string[]> = await assignPostsToUsers(trendingPosts, users);
        const postsForCurrentUser : string[] = Object.keys(userPostAssignments).filter(postId => 
            userPostAssignments[postId].includes(currentUserId)
        );
        if(postsForCurrentUser.length <= 0) return [];

        const suggestedPosts : TPostWithUser[] = await findSuggestedPosts(postsForCurrentUser);
        const combinedPosts : TPostWithUser[] = await mergeLikedAndTrendingPosts(likedPosts, suggestedPosts);
        return combinedPosts;
        
    } catch (err) {
        const error = err as TErrorHandler;
        throw new ErrorHandler(`An error occurred : ${error.message}`, error.statusCode);
    }
}

export const likePostService = async (currentUserId : string, postId : string) => {
    try {
        const hasLiked : TInferSelectPostLike | undefined = await findFirstLike(currentUserId, postId);
        if(!hasLiked) {
            const post : TPostWithUser = await findFirstPost(postId);
            if(!post) throw new ResourceNotFoundError();
            
            incrementCacheScore(`user:${currentUserId}:likes:authorsId`, 1, post.userId);
            return 'Post has been liked';
        }
        
    } catch (err) {
        const error = err as TErrorHandler;
        throw new ErrorHandler(`An error occurred : ${error.message}`, error.statusCode);
    }
}

const assignLikedPostsToUser = async (usersId : TPostAssignments) : Promise<TPostWithUser[]> => {
    const matchedPosts : TPostWithUser[] = [];

    const usersArray : likesArray[] = Object.entries(usersId).map(([userId, likedCount]) => ({userId, likedCount : +likedCount}));
    usersArray.sort((a, b) => b.likedCount - a.likedCount);

    for (const { userId } of usersArray) {
        const posts : TPostWithUser[] = await findManyPostByUserId(userId);
        matchedPosts.push(...posts);
    }

    if(matchedPosts.length <= 0) return [];
    return matchedPosts as TPostWithUser[];
}

const mergeLikedAndTrendingPosts = async (likedPosts : TPostWithUser[], trendingPosts : TPostWithUser[]) : Promise<TPostWithUser[]> => {
    const mergedPosts : TPostWithUser[] = [...likedPosts, ...trendingPosts];
    return shuffleArray(mergedPosts);
}

// const fetchLikedPostsUserId = async () => {
//     const postAuthors: string[] = await scanTheCache('user:*:likes:authorsId');
//     const postUserIdLikeCountMap: Record<string, string> = postAuthors.reduce((accumulator, currentValue, currentIndex, array) => {
//         if (currentIndex % 2 === 0) accumulator[currentValue] = array[currentIndex + 1];
//         return accumulator;
//     }, {} as Record<string, string>);
    
//     return postUserIdLikeCountMap;
// }