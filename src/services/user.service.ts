import type { TErrorHandler, TFollowerProfile, TFollowersRelations, TFollowingProfile, TInferSelectUserNoPass, TInferSelectUserProfile, TInferUpdateUser, TModifiedFollowingProfile, TUpdateProfileInfo, TUserProfile, TUserWithProfileInfo, TUserWithRelations } from '../types/index.type';
import { getAllFromHashCache, getHashWithIndexCache } from '../database/cache/index.cache';
import { searchByUsernameInCache, searchInCache, updateUserCache } from '../database/cache/user.cache';
import { findFirstFollow, findFirstProfile, findFirstUser, findManyFollowingsId, findManyFollowings, findManyUsers, findManyUsersById, insertProfileInfo, searchUserByUsername, updateAccount, updateProfileInfo, findManyFollowingsWithUser, 
    findManyFollowersWithUser} from '../database/queries/user.query';
import emailEventEmitter from '../events/email.event';
import { userEventEmitter } from '../events/user.event';
import { BadRequestError, EmailOrUsernameExistsError, PasswordDoesNotMatch, PasswordValidationError, ResourceNotFoundError, 
    comparePassword, hashPassword } from '../libs/utils';
import ErrorHandler from '../libs/utils/errorHandler';
import { getListScore } from '../database/cache/index.cache';
import { arrayToKeyValuePairs } from './post.service';

export const updateProfileInfoService = async (fullName : string, bio : string, profilePic : string, gender : 'male' | 'female', 
    currentUser : TInferSelectUserNoPass
) => {
    try {
        let profileFromDB : TInferSelectUserProfile | undefined;
        const profileFromCache : TInferSelectUserProfile = await getAllFromHashCache(`profile:user:${currentUser.id}`);

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
        
    } catch (err : unknown) {
        const error = err as TErrorHandler;
        throw new ErrorHandler(`An error occurred : ${error.message}`, error.statusCode);
    }
};

export const combineUserProfileWithUser = (profile : TInferSelectUserProfile | null, user : TInferSelectUserNoPass) => {
    const { id, username, email, role, createdAt, updatedAt } = user;
    if(profile) {
        const filteredProfile = Object.fromEntries(
            Object.entries(profile!).filter(([key, value]) => value !== null && key !== 'id' && key !== 'userId')
        );
        return {id, username, email, role, createdAt, updatedAt, ...filteredProfile}
    }
    return {id, username, email, role, createdAt, updatedAt}
};

export const searchUserService = async (username : string, currentUserId : string, startIndex : number, limit : number) => {
    try {
        const usernameRegExp : RegExp = new RegExp(username, 'i');

        const cachedUsers : TUserProfile[] = await searchByUsernameInCache(username);
        const matchedUsersInCache : (TInferSelectUserNoPass | undefined)[] = await Promise.all(cachedUsers.map(async user => {
            if(usernameRegExp.test(user.username)) return user;
        }));

        if(matchedUsersInCache.length == 0) {
            const searchedUsersFromDB : TUserWithProfileInfo[] = await searchUserByUsername(username, startIndex || 0, limit || 15);
            const filteredUsersFromDB : TUserWithProfileInfo[] = searchedUsersFromDB.filter(user => user.id !== currentUserId);
            return filteredUsersFromDB;
        }
        return cachedUsers.filter(user => user.id !== currentUserId).splice(startIndex || 0, limit || 15);
        
    } catch (err : unknown) {
        const error = err as TErrorHandler;
        throw new ErrorHandler(`An error occurred : ${error.message}`, error.statusCode);
    }
};
// clean this function do some event
export const followUserService = async (currentUser : TInferSelectUserNoPass, userToFollowId : string) : Promise<string> => {
    try {
        let userToFollowProfile : TUserWithProfileInfo | undefined;
        let isAlreadyFollowing : unknown;
        
        const followedUserProfileFromCache : TUserWithProfileInfo = await getAllFromHashCache(`user:${userToFollowId}`);
        const alreadyFollowingFromCache : TUserWithProfileInfo = await getHashWithIndexCache(`followings:${currentUser.id}`, userToFollowId);

        userToFollowProfile = followedUserProfileFromCache;
        isAlreadyFollowing = alreadyFollowingFromCache as TUserWithProfileInfo;

        if(Object.keys(followedUserProfileFromCache).length <= 0) userToFollowProfile = await findFirstUser(undefined, undefined, userToFollowId);
        if(!alreadyFollowingFromCache) isAlreadyFollowing = await findFirstFollow(currentUser.id, userToFollowId);
        if(currentUser.id == userToFollowId) throw new BadRequestError();
        const {password, ...others} = userToFollowProfile as TUserWithProfileInfo;

        if(!isAlreadyFollowing) {
            userEventEmitter.emit('follow', userToFollowId, others, currentUser)
            return 'User followed successfully';
        }
        userEventEmitter.emit('unfollow', currentUser, userToFollowId);
        return 'User unfollowed successfully';
        
    } catch (err : unknown) {
        const error = err as TErrorHandler;
        throw new ErrorHandler(`An error occurred : ${error.message}`, error.statusCode);
    }
};

export const getUserProfileService = async (currentUser : TUserProfile) => {
    try {
        const followersFromCache : TUserProfile = await getAllFromHashCache(`followers:${currentUser.id}`);
        const followingFromCache : TUserProfile = await getAllFromHashCache(`followings:${currentUser.id}`);
        return {currentUserProfile : currentUser, followersCount : Object.keys(followersFromCache).length, 
            followingCount : Object.keys(followingFromCache).length
        };
        
    } catch (err : unknown) {
        const error = err as TErrorHandler;
        throw new ErrorHandler(`An error occurred : ${error.message}`, error.statusCode);
    }
};

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
        
    } catch (err : unknown) {
        const error = err as TErrorHandler;
        throw new ErrorHandler(`An error occurred : ${error.message}`, error.statusCode);
    }
};

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
        
    } catch (err : unknown) {
        const error = err as TErrorHandler;
        throw new ErrorHandler(`An error occurred : ${error.message}`, error.statusCode);
    }
};

export const suggestionForFollowService = async (currentUserId : string) => {
    try {
        let topFollowedUsers : TUserWithProfileInfo[];
        const suggestMap : Map<string, TUserWithRelations | null> = new Map<string, TUserWithRelations | null>();

        const suggestedUsers : TUserWithProfileInfo[] = await getTopLikedPostsCreators(currentUserId);
        const followingsSuggestion : (TUserWithProfileInfo | null)[] = await getFollowings_Of_followings(currentUserId);

        const topFollowedUsersCache : Record<string, string> = await getAllFromHashCache(`top_followers:${currentUserId}`);
        topFollowedUsers = Object.entries(topFollowedUsersCache).map(value => JSON.parse(value[1]))

        if (Object.keys(topFollowedUsersCache).length == 0) {
            topFollowedUsers = await getTopFollowedUsers(currentUserId);
        }

        [...topFollowedUsers, ...suggestedUsers, ...followingsSuggestion].forEach(user => {
            suggestMap.set(user!.id, user);
        });

        return Array.from(suggestMap.values());
        
    } catch (err : unknown) {
        const error = err as TErrorHandler;
        throw new ErrorHandler(`An error occurred : ${error.message}`, error.statusCode);
    }
};

export const getTopLikedPostsCreators = async (currentUserId : string) => {
    const currentUserFollowings = await findManyFollowingsId(currentUserId, 0);
    const likedPostCreatorsId : string[] = await getListScore(`posts_liked:${currentUserId}`);
    const creators : Record<string, string> = arrayToKeyValuePairs(likedPostCreatorsId);

    const creatorsArray : Array<{userId: string; likeCount: number;}> = Object.entries(creators).map(([userId, likeCount]) => 
        ({userId, likeCount : +likeCount}));
    
    const suggestedCreatorsId = creatorsArray.filter(creator => !currentUserFollowings.some(user => user.followedId === creator.userId));
    creatorsArray.sort((a, b) => b.likeCount - a.likeCount);
    const suggestedCreators : TUserWithProfileInfo[] = await findManyUsersById(suggestedCreatorsId.map(creator => creator.userId), 5);

    return suggestedCreators;
};

export const getFollowings_Of_followings = async (currentUserId : string) => {
    const currentUserFollowings : TFollowersRelations[] = await findManyFollowings(currentUserId, 0);
    const modifiedFollowings : (TUserWithProfileInfo | null)[] = currentUserFollowings.flatMap(follow => 
        follow.follower ? follow.follower.followings.map(following => following.follower) : []
    ).filter(following => following !== null)
    
    const suggestedUsers : (TUserWithProfileInfo | null)[] = modifiedFollowings.filter(
        user => !currentUserFollowings.some(following => following.follower?.id === user!.id)
    ).splice(0, 5);
    return suggestedUsers;
};

export const getTopFollowedUsers = async (currentUserId : string) => {
    const users : TUserWithRelations[] = await findManyUsers(currentUserId, 0);
    users.sort((a, b) => b.followers!.length - a.followers!.length);

    const fixedResult : TUserWithProfileInfo[] = users.map(user => {
        const { id, username, email, role, profile, createdAt, updatedAt } = user;
        return {id, username, email, role, createdAt, updatedAt, profile} as TUserWithProfileInfo
    }).splice(0, 5);

    userEventEmitter.emit('addSuggestedUsersToCache', fixedResult, currentUserId);
    return fixedResult;
};

export const followingsService = async (currentUserId : string, offset : number, limit : number) : 
Promise<TModifiedFollowingProfile[] | undefined> => {
    try {
        const followingsCache : Record<string, string> = await getAllFromHashCache(`followings:${currentUserId}`);
        const followings : TModifiedFollowingProfile[] = Object.values(followingsCache).map(following => JSON.parse(following))
        .splice(offset || 0, limit || 15);

        if(Object.keys(followingsCache).length == 0) {
            const followings : TFollowingProfile[] = await findManyFollowingsWithUser(currentUserId, limit || 15, offset || 0);
            return followings.map(following => following.follower);
        }

        return followings;
        
    } catch (err : unknown) {
        const error = err as TErrorHandler;
        throw new ErrorHandler(`An error occurred : ${error.message}`, error.statusCode);
    }
}

export const followersService = async (currentUserId : string, offset : number, limit : number) : 
Promise<TModifiedFollowingProfile[] | undefined> => {
    try {
        const followersCache : Record<string, string> = await getAllFromHashCache(`followers:${currentUserId}`);
        const followers : TModifiedFollowingProfile[] = Object.values(followersCache).map(follower => JSON.parse(follower))
        .splice(offset || 0, limit || 15);

        if(Object.keys(followersCache).length == 0) {
            const followers : TFollowerProfile[] = await findManyFollowersWithUser(currentUserId, limit || 15, offset || 0);
            return followers.map(followers => followers.followed);
        }

        return followers;
        
    } catch (err : unknown) {
        const error = err as TErrorHandler;
        throw new ErrorHandler(`An error occurred : ${error.message}`, error.statusCode);
    }
}