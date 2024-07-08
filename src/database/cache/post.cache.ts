import type { TPostWithRelations } from '../../types/index.type';
import { redis } from '../redis';
import { getAllFromHashCache, getHashWithIndexCache, getListScore, removeScoreCache } from './index.cache';

export const scanTheCache = async (scanKey : string) : Promise<string[]> => {
    let cursor : string = '0';
    const matchedResults : string[] = [];

    do {
        const [newCursor, keys] = await redis.scan(cursor, 'MATCH', scanKey, 'COUNT', 100);
        for (const key of keys) {
            const postsId : string[] = await getListScore(key);
            matchedResults.push(...postsId);
        }

        cursor = newCursor;
    } while (cursor !== '0');
    return matchedResults;
}

export const scanPostCache = async (creatorId : string) : Promise<TPostWithRelations[]> => {
    let cursor : string = '0';
    const matchedPosts : TPostWithRelations[] = [];

    do {
        const [newCursor, keys] = await redis.scan(cursor, 'MATCH', 'post:*', 'COUNT', 100);
        for (const key of keys) {
            const post : TPostWithRelations = await getAllFromHashCache(key);
            if(post.userId === creatorId) {
                matchedPosts.push(post);
            }
        }

        cursor = newCursor;
    } while (cursor !== '0');
    return matchedPosts;
}

export const findManyUsersCache = async () : Promise<Array<{id : string}>> => {
    let cursor : string = '0';
    const matchedUsers : Array<{id : string}> = [];

    do {
        const [newCursor, keys] = await redis.scan(cursor, 'MATCH', 'user:*', 'COUNT', 100);
        for (const key of keys) {
            const id : string = await getHashWithIndexCache(key, 'id');
            matchedUsers.push({id});
        }

        cursor = newCursor;
    } while (cursor !== '0');
    return matchedUsers;
}

export const removeIndexFromMultipleListCache = async (postId : string) : Promise<void> => {
    let cursor : string = '0';
    do {
        const [newCursor, keys] = await redis.scan(cursor, 'MATCH', 'posts_liked:*', 'COUNT', 100);
        for (const key of keys) {
            await removeScoreCache(key, postId);
        }

        cursor = newCursor;
    } while (cursor !== '0');
}