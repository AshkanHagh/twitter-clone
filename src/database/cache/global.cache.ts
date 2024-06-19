import { redis } from '../redis';

export const InsertIntoHashCache = async (key : string, value : unknown, expiresIn : number) : Promise<void> => {
    await redis.hset(key, value!);
    await redis.expire(key, expiresIn);
}

export const findInHashCache = async <T>(key : string) : Promise<T> => {
    return await redis.hgetall(key) as T;
}

export const deleteFromCache = async (key : string) : Promise<void> => {
    await redis.del(key);
}

export const insertHashListCache = async (key : string, index : string, value : unknown, expireTime : number) : Promise<void> => {
    await redis.hset(key, index, JSON.stringify(value));
    await redis.expire(key, expireTime);
}

export const deleteHashListCache = async (key : string, index : string) : Promise<void> => {
    await redis.hdel(key, index);
}

export const findInHashListCache = async <T>(key : string, index : string) : Promise<T> => {
    return await redis.hget(key, index) as T;
}