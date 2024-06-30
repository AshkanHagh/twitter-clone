import { addToHashCache, getAllFromHashCache } from './index.cache';
import type { TCacheIndex, TInferSelectUserNoPass, TInferUpdateUser, TUserProfile } from '../../types/types';
import { regexp } from '../../libs/utils';
import { redis } from '../redis';

export const searchByUsernameInCache = async (username : string) : Promise<TUserProfile[]> => {
    const escapedQuery : RegExp = regexp(username);
    let cursor : string = '0';
    const matchedUsers : TUserProfile[] = [];

    do {
        const [newCursor, keys] = await redis.scan(cursor, 'MATCH', 'user:*', 'COUNT', 100);
        for (const key of keys) {
            const user : TUserProfile = await getAllFromHashCache(key);
            if(escapedQuery.test(user.username)) {matchedUsers.push(user)};
        }
        cursor = newCursor;
    } while (cursor !== '0');
    return matchedUsers;
}

export const updateUserCache = async (user : TInferUpdateUser) : Promise<void> => {
    await addToHashCache(`user:${user.id}`, user, 604800);
    const updatedUser : TInferSelectUserNoPass = await getAllFromHashCache(`user:${user.id}`);

    const updateCacheForPattern = async (pattern : string) : Promise<void> => {
        let cursor = '0';
        do {
            const [newCursor, keys] : [string, string[]] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);

            const pipeline = redis.pipeline();
            await Promise.all(keys.map(async key => {
                const followers : TCacheIndex = await getAllFromHashCache<TCacheIndex>(key);
                if (followers[user.id]) {
                    pipeline.hset(key, user.id, JSON.stringify(updatedUser));
                }
            }));
            await pipeline.exec();
            cursor = newCursor;
        } while (cursor !== '0');
    };

    await Promise.all([updateCacheForPattern('followers:*'), updateCacheForPattern('followings:*')]);
};

export const searchInCache = async (email : string, username : string) => {
    let cursor : string = '0';
    do {
        const [newCursor, keys] = await redis.scan(cursor, 'MATCH', 'user:*', 'COUNT', 100);
        for (const key of keys) {
            const user : TUserProfile = await getAllFromHashCache(key);
            if(user.email == email || user.username == username) {
                return user;
            }
        }

        cursor = newCursor;
    } while (cursor !== '0');
}