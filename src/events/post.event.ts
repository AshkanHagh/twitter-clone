import { EventEmitter } from 'node:events';
import { deleteFirstPost, deleteLikePost, findFirstPost, findManyPosts, insertLikePost } from '../database/queries/post.query';
import { addToHashCache, addToListWithScore, deleteFromCache, getListScore, removeScoreCache } from '../database/cache/index.cache';
import type { TInferSelectComment, TInferSelectUserNoPass, TPostWithRelations } from '../types/types';
import { removeIndexFromMultipleListCache } from '../database/cache/post.cache';
import { insertNotification } from '../database/queries/notification.query';
import { arrayToKeyValuePairs } from '../services/post.service';

export const postEventEmitter = new EventEmitter();

postEventEmitter.on('create-post', async () : Promise<void> => {
    const posts : TPostWithRelations[] = await findManyPosts();
    for (const post of posts) {
        const { id, text, image, createdAt, updatedAt, comments, likes, tags, user, userId} = post;
        const likesUserInfo : TInferSelectUserNoPass[] | undefined = likes?.map(user => user.user);
        const commentsInfo : TInferSelectComment[] | undefined = comments?.map(comment => comment.comment);

        const fixedResult = {
            id, userId, text, image, createdAt, updatedAt,
            comments : JSON.stringify(commentsInfo), likes : JSON.stringify(likesUserInfo),
            tags, user : JSON.stringify(user)
        };

        addToHashCache(`post:${post.id}`, fixedResult, 2419200);
    }
});

postEventEmitter.on('updated-post', async (postId : string) : Promise<void> => {
    const post : TPostWithRelations = await findFirstPost(postId);
    const { id, text, image, createdAt, updatedAt, comments, likes, tags, user, userId} = post;
    const likesUserInfo : TInferSelectUserNoPass[] | undefined = likes?.map(user => user.user);
    const commentsInfo : TInferSelectComment[] | undefined = comments?.map(comment => comment.comment);

    const fixedResult = {
        id, userId, text, image, createdAt, updatedAt,
        comments : JSON.stringify(commentsInfo), likes : JSON.stringify(likesUserInfo),
        tags, user : JSON.stringify(user)
    };
    addToHashCache(`post:${post.id}`, fixedResult, 2419200);
});

postEventEmitter.on('delete-post', async (userId : string, postId : string) : Promise<void> => {
    await Promise.all([
        deleteFirstPost(postId), deleteFromCache(`post:${postId}`),
        removeScoreCache(`suggest_post:${userId}`, postId),
        removeIndexFromMultipleListCache(postId),
    ])
})

postEventEmitter.on('like-post', async (currentUserId : string, userId : string, postId : string) : Promise<void> => {
    await Promise.all([
        await insertNotification(currentUserId, userId, 'like'),
        await insertLikePost(currentUserId, postId)
    ]);

    addToListWithScore(`posts_liked:${currentUserId}`, 1, userId);
    addToListWithScore(`suggest_post:${userId}`, 3, postId);
    postEventEmitter.emit('updated-post', postId);
})

postEventEmitter.on('dislike-post', async (currentUserId : string, userId : string, postId : string) : Promise<void> => {
    await deleteLikePost(currentUserId, postId);
    const likesArray : string[] = await getListScore(`posts_liked:${currentUserId}`);
    const likeObject = arrayToKeyValuePairs(likesArray);
    
    if(likeObject[userId] === '0' || likeObject[userId] === '1') {
        removeScoreCache(`posts_liked:${currentUserId}`, userId);
    }else {
        addToListWithScore(`posts_liked:${currentUserId}`, -1, userId);
    }

    addToListWithScore(`suggest_post:${userId}`, -3, postId);
    postEventEmitter.emit('updated-post', postId);
})