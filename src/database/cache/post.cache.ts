import { redis } from '../redis';

export const incrementCacheScore = async (key : string, incrementAmount : (string | number), postId : string) => {
    await redis.zincrby(key, incrementAmount, postId);
}

export const scanTheCache = async (scanKey : string) => {
    let cursor = '0';
    const matchedResults = [];

    do {
        const [newCursor, keys] = await redis.scan(cursor, 'MATCH', scanKey, 'COUNT', 100);
        for (const key of keys) {
            const postsId = await redis.zrevrange(key, 0, -1, 'WITHSCORES');
            matchedResults.push(postsId);
        }

        cursor = newCursor;
    } while (cursor !== '0');
    return matchedResults.flat();
}