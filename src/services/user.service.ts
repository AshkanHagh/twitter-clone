import type { TErrorHandler, TInferSelectUserNoPass, TInferSelectUserProfile, TInferUpdateUser, TUpdateProfileInfo, 
    TUserProfile, TUserWithProfileInfo } from '../@types';
import { deleteHashListCache, findInHashCache, findInHashListCache, insertHashListCache } from '../database/cache';
import { searchByUsernameInCache, searchInCache, updateUserCache } from '../database/cache/user.cache';
import { deleteFollow, findFirstFollow, findFirstProfile, findFirstUser, insertFollow, insertProfileInfo, searchUserByUsername, 
    updateAccount, updateProfileInfo } from '../database/queries/user.query';
import emailEventEmitter from '../events/email.event';
import { notificationEventEmitter } from '../events/notification.event';
import { userEventEmitter } from '../events/user.event';
import { EmailOrUsernameExistsError, PasswordDoesNotMatch, PasswordValidationError, ResourceNotFoundError, 
    comparePassword, hashPassword } from '../libs/utils';
import ErrorHandler from '../libs/utils/errorHandler';

export const updateProfileInfoService = async (fullName : string, bio : string, profilePic : string, gender : 'male' | 'female', 
    currentUser : TInferSelectUserNoPass
) => {
    try {
        let profileFromDB : TInferSelectUserProfile | undefined;
        const profileFromCache : TInferSelectUserProfile = await findInHashCache(`profile:user:${currentUser.id}`);

        profileFromDB = profileFromCache;
        if(Object.keys(profileFromCache).length <= 0) profileFromDB = await findFirstProfile(currentUser.id);

        if(!profileFromDB) {
            const newProfileInfo : TInferSelectUserProfile = await insertProfileInfo(fullName, bio, profilePic, gender, currentUser.id);
            const combinedUserProfile = combineUserProfileWithUser(newProfileInfo, currentUser);
            userEventEmitter.emit('updateProfile', currentUser.id, combinedUserProfile , newProfileInfo);
            return combinedUserProfile ;
        }
        const updatedProfileInfo = {fullName : fullName || profileFromDB.fullName, bio : bio || profileFromDB.bio,
            profilePic : profilePic || profileFromDB.profilePic, gender : gender || profileFromDB.gender, userId : currentUser.id
        } as TUpdateProfileInfo;

        const updatedProfile : TInferSelectUserProfile = await updateProfileInfo(updatedProfileInfo);
        const combinedUserProfile = combineUserProfileWithUser(updatedProfile, currentUser);

        userEventEmitter.emit('updateProfile', currentUser.id, combinedUserProfile, updatedProfile);
        return combinedUserProfile ;
        
    } catch (err) {
        const error = err as TErrorHandler;
        throw new ErrorHandler(`An error occurred : ${error.message}`, error.statusCode);
    }
}

export const combineUserProfileWithUser = (profile : TInferSelectUserProfile | null, user : TInferSelectUserNoPass) => {
    const { id, username, email, role, createdAt, updatedAt } = user;
    if(profile) {
        const filteredProfile = Object.fromEntries(
            Object.entries(profile!).filter(([key, value]) => value !== null && key !== 'id' && key !== 'userId')
        );
        return {id, username, email, role, createdAt, updatedAt, ...filteredProfile}
    }
    return {id, username, email, role, createdAt, updatedAt}
}

export const searchUserService = async (username : string, currentUserId : string) => {
    try {
        const usernameRegExp : RegExp = new RegExp(username, 'i');

        const cachedUsers : TUserProfile[] = await searchByUsernameInCache(username);
        const matchedUsersInCache : (TInferSelectUserNoPass | undefined)[] = await Promise.all(cachedUsers.map(async user => {
            if(usernameRegExp.test(user.username)) return user;
        }));

        if(matchedUsersInCache.length <= 0) {
            const searchedUsersFromDB : TUserWithProfileInfo[] = await searchUserByUsername(username);
            const filteredUsersFromDB : TUserWithProfileInfo[] = searchedUsersFromDB.filter(user => user.id !== currentUserId);
            return filteredUsersFromDB;
        }
        return cachedUsers.filter(user => user.id !== currentUserId);
        
    } catch (err) {
        const error = err as TErrorHandler;
        throw new ErrorHandler(`An error occurred : ${error.message}`, error.statusCode);
    }
}

export const followUserService = async (currentUser : TInferSelectUserNoPass, userToFollowId : string) : Promise<string> => {
    try {
        let userToFollowProfile : TUserWithProfileInfo | undefined;
        let isAlreadyFollowing : unknown;
        
        const followedUserProfileFromCache : TUserWithProfileInfo = await findInHashCache(`user:${userToFollowId}`);
        const alreadyFollowingFromCache : TUserWithProfileInfo = await findInHashListCache(`followings:${currentUser.id}`, userToFollowId);

        if(Object.keys(followedUserProfileFromCache || '').length <= 0) {
            userToFollowProfile = await findFirstUser(undefined, undefined, userToFollowId);
        }
        if(Object.keys(alreadyFollowingFromCache || '').length <= 0) {
            isAlreadyFollowing = await findFirstFollow(currentUser.id, userToFollowId);
        }

        userToFollowProfile = followedUserProfileFromCache;
        isAlreadyFollowing = alreadyFollowingFromCache as TUserWithProfileInfo;

        if(!isAlreadyFollowing) {
            await Promise.all([insertFollow(currentUser.id, userToFollowId),
                insertHashListCache(`followings:${currentUser.id}`, userToFollowId, userToFollowProfile, 604800),
                insertHashListCache(`followers:${userToFollowId}`, currentUser.id, currentUser, 604800)
            ]);
            notificationEventEmitter.emit('follow', currentUser.id, userToFollowId);
            return 'User followed successfully';
        }
        await Promise.all([deleteFollow(currentUser.id, userToFollowId),
            deleteHashListCache(`followings:${currentUser.id}`, userToFollowId), deleteHashListCache(`followers:${userToFollowId}`, currentUser.id)
        ]);
        return 'User unfollowed successfully';
        
    } catch (err) {
        const error = err as TErrorHandler;
        throw new ErrorHandler(`An error occurred : ${error.message}`, error.statusCode);
    }
}

export const getUserProfileService = async (currentUser : TUserProfile) => {
    try {
        const followersFromCache : TUserProfile = await findInHashCache(`followers:${currentUser.id}`);
        const followingFromCache : TUserProfile = await findInHashCache(`followings:${currentUser.id}`);
        return {currentUserProfile : currentUser, followersCount : Object.keys(followersFromCache).length, 
            followingCount : Object.keys(followingFromCache).length
        };
        
    } catch (err) {
        const error = err as TErrorHandler;
        throw new ErrorHandler(`An error occurred : ${error.message}`, error.statusCode);
    }
}

export const updateAccountInfoService = async (currentUser : TUserProfile, email : string, username : string) => {
    try {
        let existingUser : TUserProfile | undefined;

        const existingCacheUser : TUserProfile | undefined = await searchInCache(email, username);
        existingUser = existingCacheUser;
        if(!existingCacheUser) existingUser = await findFirstUser(email, username, undefined);
        if(existingUser) throw new EmailOrUsernameExistsError();

        const updatedAccountInfo = {email : email || currentUser.email, username : username || currentUser.username, id : currentUser.id};
        const updatedUser : TInferUpdateUser | undefined = await updateAccount(updatedAccountInfo);
    
        updateUserCache(updatedUser || currentUser);
        return updatedUser;
        
    } catch (err) {
        const error = err as TErrorHandler;
        throw new ErrorHandler(`An error occurred : ${error.message}`, error.statusCode);
    }
}

export const updateAccountPasswordService = async (currentUserId : string, newPassword : string, oldPassword : string) => {
    try {
        const currentUser : TUserWithProfileInfo | undefined = await findFirstUser(undefined, undefined, currentUserId);
        if(!currentUser) throw new ResourceNotFoundError();

        const isPasswordMatching : boolean = await comparePassword(oldPassword, currentUser?.password || '');
        if(!isPasswordMatching) throw new PasswordDoesNotMatch();
        if(newPassword === oldPassword) throw new PasswordValidationError();

        const hashedNewPassword : string = await hashPassword(newPassword);
        await updateAccount({password : hashedNewPassword, id : currentUserId});
        emailEventEmitter.emit('changedPassword', currentUser.email);

        return 'Password has been updated';
        
    } catch (err) {
        const error = err as TErrorHandler;
        throw new ErrorHandler(`An error occurred : ${error.message}`, error.statusCode);
    }
}