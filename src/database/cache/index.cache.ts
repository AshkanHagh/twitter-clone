import { redis } from '../redis';

export const addToHashCache = async (hashKey : string, hashValue : unknown, expirationTime : number) : Promise<void> => {
    await redis.hset(hashKey, hashValue!);
    await redis.expire(hashKey, expirationTime);
}

export const getAllFromHashCache = async <T>(hashKey : string) : Promise<T> => {
    return await redis.hgetall(hashKey) as T;
}

export const deleteFromCache = async (key : string) : Promise<void> => {
    await redis.del(key);
}

export const addHashListCache = async (hashKey : string, listIndex : string, listValue : unknown, expirationTime : number) : Promise<void> => {
    await redis.hset(hashKey, listIndex, JSON.stringify(listValue));
    await redis.expire(hashKey, expirationTime);
}

export const removeFromHashListCache = async (hashKey : string, listIndex : string) : Promise<void> => {
    await redis.hdel(hashKey, listIndex);
}

export const getHashWithIndexCache = async <T>(hashKey : string, listIndex : string) : Promise<T> => {
    return await redis.hget(hashKey, listIndex) as T;
}

export const addToListCache = async (listKey : string, listValue : unknown, expirationTime : number) : Promise<void> => {
    await redis.lpush(listKey, JSON.stringify(listValue));
    await redis.expire(listKey, expirationTime);
}

export const getListCache = async <T>(listKey : string) : Promise<T> => {
    return await redis.lrange(listKey, 0, -1) as T;
}

export const deleteListCache = async (listKey : string) : Promise<void> => {
    await redis.del(listKey);
}

export const getMultipleFromHashCache = async <T>(baseKey : string, subKeys : string[]) : Promise<T[]> => {
    const results : T[] = [];
    for (const subKey of subKeys) {
        results.push(await redis.hgetall(`${baseKey}:${subKey}`) as T);
    }
    return results;
}

export const addToListWithScore = async (listKey : string, incrementAmount : (string | number), listValue : string) => {
    await redis.zincrby(listKey, incrementAmount, listValue);
}

export const removeScoreCache = async (listKey : string, listIndex : string) => {
    await redis.zrem(listKey, listIndex);
}

export const getListScore = async (listKey : string) => {
    return await redis.zrevrange(listKey, 0, -1, 'WITHSCORES');
}