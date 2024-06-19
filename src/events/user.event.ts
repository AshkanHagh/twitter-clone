import { EventEmitter } from 'node:events';
import { InsertIntoHashCache } from '../database/cache/global.cache';
import type { TInferSelectUserProfile, TUserWithProfileInfo } from '../@types';
import { updateUserCache } from '../database/cache/user.cache';

export const userEventEmitter = new EventEmitter();

userEventEmitter.on('updateProfile', (userId : string, userHashValue : TUserWithProfileInfo, profileValue : TInferSelectUserProfile) => {
    InsertIntoHashCache(`user:${userId}`, userHashValue, 604800);
    InsertIntoHashCache(`profile:user:${userId}`, profileValue, 604800);
    updateUserCache(userHashValue);
});