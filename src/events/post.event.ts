import { EventEmitter } from 'node:events';
import { findFirstPost, findManyPosts } from '../database/queries/post.query';
import { addToHashCache } from '../database/cache/index.cache';
import type { TPostWithRelations } from '../types/types';

export const postEventEmitter = new EventEmitter();

postEventEmitter.on('create-post', async () => {
    const posts : TPostWithRelations[] = await findManyPosts();
    for (const post of posts) {
        const { id, text, image, createdAt, updatedAt, comments, likes, tags, user, userId} = post;
        const fixedResult = {
            id, userId, text, image, createdAt, updatedAt,
            comments : JSON.stringify(comments), likes : JSON.stringify(likes),
            tags, user : JSON.stringify(user)
        };

        addToHashCache(`post:${post.id}`, fixedResult, 2419200);
    }
});

postEventEmitter.on('updated-post', async (postId : string) => {
    const post : TPostWithRelations = await findFirstPost(postId);
    const { id, text, image, createdAt, updatedAt, comments, likes, tags, user, userId} = post;
        const fixedResult = {
            id, userId, text, image, createdAt, updatedAt,
            comments : JSON.stringify(comments), likes : JSON.stringify(likes),
            tags, user : JSON.stringify(user)
        };
    addToHashCache(`post:${post.id}`, fixedResult, 2419200);
});