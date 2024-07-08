import { EventEmitter } from 'node:events';
import { addHashListCache, addToHashCache } from '../database/cache/index.cache';
import type { TInferSelectUserProfile, TUserWithProfileInfo, TUserWithRelations } from '../types/index.type';
import { updateUserCache } from '../database/cache/user.cache';
import { getFollowings_Of_followings, getTopFollowedUsers, getTopLikedPostsCreators } from '../services/user.service';

export const userEventEmitter = new EventEmitter();

userEventEmitter.on('updateProfile', (userId : string, userHashValue : TUserWithProfileInfo, profileValue : TInferSelectUserProfile) => {
    addToHashCache(`user:${userId}`, userHashValue, 604800);
    addToHashCache(`profile:user:${userId}`, profileValue, 604800);
    updateUserCache(userHashValue);
});

userEventEmitter.on('addSuggestedUsersToCache', (value : TUserWithRelations[], currentUserId : string) => {
    value.forEach(async user => {
        await addHashListCache(`top_followers:${currentUserId}`, user.id, user, 604800);
    })
});

userEventEmitter.on('updateSuggestedUsersCache', async (currentUserId : string) => {
    await Promise.all([getTopLikedPostsCreators(currentUserId), getFollowings_Of_followings(currentUserId),
        getTopFollowedUsers(currentUserId)
    ])
});