import { EventEmitter } from 'node:events';
import { addHashListCache, addToHashCache, removeFromHashListCache } from '../database/cache/index.cache';
import type { TInferSelectUserNoPass, TInferSelectUserProfile, TUserWithProfileInfo, TUserWithRelations } from '../types/index.type';
import { updateUserCache } from '../database/cache/user.cache';
import { getFollowings_Of_followings, getTopFollowedUsers, getTopLikedPostsCreators } from '../services/user.service';
import { notificationEventEmitter } from './notification.event';
import { deleteFollow, insertFollow } from '../database/queries/user.query';

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

userEventEmitter.on('follow', async (userToFollowId : string, others : unknown, currentUser : TInferSelectUserNoPass) => {
    await Promise.all([insertFollow(currentUser.id, userToFollowId),
        addHashListCache(`followings:${currentUser.id}`, userToFollowId, others, 604800),
        addHashListCache(`followers:${userToFollowId}`, currentUser.id, currentUser, 604800)
    ]);
    notificationEventEmitter.emit('follow', currentUser.id, userToFollowId);
});

userEventEmitter.on('unfollow', async (currentUser : TInferSelectUserNoPass, userToFollowId : string) => {
    await Promise.all([deleteFollow(currentUser.id, userToFollowId),
        removeFromHashListCache(`followings:${currentUser.id}`, userToFollowId), 
        removeFromHashListCache(`followers:${userToFollowId}`, currentUser.id)
    ]);
});