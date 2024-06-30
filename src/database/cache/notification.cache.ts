import { redis } from '../redis';

export const updateNotificationCache = async (key : string) => {
    const luaScript = `
    local list = redis.call('LRANGE', KEYS[1], 0, -1)
    for i=1,#list do
        local item = cjson.decode(list[i])
        item.read = true
        redis.call('LSET', KEYS[1], i-1, cjson.encode(item))
    end
    `;

    await redis.eval(luaScript, 1, key);
}

export const getAndUpdateListCache = async <T>(listKey : string) : Promise<T> => {
    await updateNotificationCache(listKey);
    return await redis.lrange(listKey, 0, -1) as T;
}