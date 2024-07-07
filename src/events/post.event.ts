import { EventEmitter } from 'node:events';
import { deleteFirstPost, deleteLikePost, findFirstPostWithPostId, findManyPosts, insertLikePost } from '../database/queries/post.query';
import { addToHashCache, addToListWithScore, deleteFromCache, getListScore, removeScoreCache } from '../database/cache/index.cache';
import type { TSelectComment, TInferSelectUserNoPass, TPostWithRelations } from '../types/types';
import { removeIndexFromMultipleListCache } from '../database/cache/post.cache';
import { insertNotification } from '../database/queries/notification.query';
import { arrayToKeyValuePairs, calculateNumberOfSuggestions } from '../services/post.service';

export const postEventEmitter = new EventEmitter();

postEventEmitter.on('create-post', async (currentUserId : string, createdPostId : string) : Promise<void> => {
    const suggestionCount = await calculateNumberOfSuggestions(currentUserId, createdPostId, 'cerate', 0.15);
    addToListWithScore(`suggest_post:${currentUserId}`, suggestionCount, createdPostId);
});

postEventEmitter.on('post_cache', async (postId : string) : Promise<void> => {
    const post : TPostWithRelations = await findFirstPostWithPostId(postId);
    const { id, text, image, createdAt, updatedAt, comments, likes, tags, user, userId} = post;
    const likesUserInfo : TInferSelectUserNoPass[] | undefined = likes?.map(user => user.user);
    const commentsInfo : TSelectComment[] | undefined = comments?.map(comment => comment.comment);

    const fixedResult = {
        id, userId, text, image, createdAt, updatedAt,
        comments : JSON.stringify(commentsInfo), likes : JSON.stringify(likesUserInfo),
        tags, user : JSON.stringify(user)
    };

    addToHashCache(`post:${post.id}`, fixedResult, 2419200);
});

postEventEmitter.on('update-post-cache', async () : Promise<void> => {
    const posts : TPostWithRelations[] = await findManyPosts();
    for (const post of posts) {
        const { id, text, image, createdAt, updatedAt, comments, likes, tags, user, userId} = post;
        const likesUserInfo : TInferSelectUserNoPass[] | undefined = likes?.map(user => user.user);
        const commentsInfo : TSelectComment[] | undefined = comments?.map(comment => comment.comment);

        const fixedResult = {
            id, userId, text, image, createdAt, updatedAt,
            comments : JSON.stringify(commentsInfo), likes : JSON.stringify(likesUserInfo),
            tags, user : JSON.stringify(user)
        };

        addToHashCache(`post:${post.id}`, fixedResult, 2419200);
    }
});

postEventEmitter.on('delete-post', async (userId : string, postId : string) : Promise<void> => {
    await Promise.all([
        deleteFirstPost(postId), deleteFromCache(`post:${postId}`),
        removeScoreCache(`suggest_post:${userId}`, postId),
        removeIndexFromMultipleListCache(postId),
    ])
})

postEventEmitter.on('like-post', async (currentUserId : string, creatorId : string, postId : string) :
Promise<void> => {
    const suggestionCount = await calculateNumberOfSuggestions(creatorId, postId, 'other', 0.5);
    await Promise.all([
        await insertNotification(currentUserId, creatorId, 'like'),
        await insertLikePost(currentUserId, postId)
    ]);

    addToListWithScore(`posts_liked:${currentUserId}`, 1, creatorId);
    addToListWithScore(`suggest_post:${creatorId}`, suggestionCount, postId);
    postEventEmitter.emit('post_cache', postId);
})

postEventEmitter.on('dislike-post', async (currentUserId : string, creatorId : string, postId : string) : Promise<void> => {
    const suggestionCount = await calculateNumberOfSuggestions(creatorId, postId, 'other', 0.5);
    await deleteLikePost(currentUserId, postId);
    const likesArray : string[] = await getListScore(`posts_liked:${currentUserId}`);
    const suggestionPostScore : Record<string, string> = arrayToKeyValuePairs(await getListScore(`suggest_post:${creatorId}`));
    const likeObject = arrayToKeyValuePairs(likesArray);
    
    if(likeObject[creatorId] === '0' || likeObject[creatorId] === '1') {
        removeScoreCache(`posts_liked:${currentUserId}`, creatorId);
    }else {
        addToListWithScore(`posts_liked:${currentUserId}`, -1, creatorId);
    }

    if(suggestionPostScore[creatorId] > '3') {
        addToListWithScore(`suggest_post:${creatorId}`, -suggestionCount, postId);
    }else {
        removeScoreCache(`suggest_post:${creatorId}`, postId);
    }
    postEventEmitter.emit('post_cache', postId);
})