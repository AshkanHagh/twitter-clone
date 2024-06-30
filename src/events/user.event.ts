import { EventEmitter } from 'node:events';
import { addToHashCache } from '../database/cache/index.cache';
import type { TInferSelectUserProfile, TUserWithProfileInfo } from '../types/types';
import { updateUserCache } from '../database/cache/user.cache';

export const userEventEmitter = new EventEmitter();

userEventEmitter.on('updateProfile', (userId : string, userHashValue : TUserWithProfileInfo, profileValue : TInferSelectUserProfile) => {
    addToHashCache(`user:${userId}`, userHashValue, 604800);
    addToHashCache(`profile:user:${userId}`, profileValue, 604800);
    updateUserCache(userHashValue);
});