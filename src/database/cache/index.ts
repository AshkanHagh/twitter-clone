import { redis } from '../redis';

export const InsertIntoHashCache = async <T extends unknown>(key : string, value : T, expiresIn : number) : Promise<void> => {
    await redis.hset(key, value!);
    await redis.expire(key, expiresIn);
}

export const findInHashCache = async <T extends unknown>(key : string) : Promise<T> => {
    return await redis.hgetall(key) as T;
}

export const deleteFromCache = async (key : string) : Promise<void> => {
    await redis.del(key);
}