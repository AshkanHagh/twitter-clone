import type { Request, Response, NextFunction } from 'express';
import { CatchAsyncError } from '../middlewares/catchAsyncError';
import type { TInferSelectUserNoPass, TInferSelectUserProfile, TInferUpdateUser, TUserProfile } from '../@types';
import { followUserService, getUserProfileService, searchUserService, updateAccountInfoService, updateAccountPasswordService, 
    updateProfileInfoService } from '../services/user.service';

export const updateProfileInfo = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {
    try {
        const { fullName, bio, profilePic, gender } = req.body as TInferSelectUserProfile;
        const loggedInUser  = req.user;

        const updatedProfileInfo : TUserProfile = await updateProfileInfoService(fullName!, bio!, profilePic!, gender!, loggedInUser !);
        res.status(200).json({success : true, updatedProfileInfo});
        
    } catch (error) {
        return next(error);
    }
});

export const searchUser = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {
    try {
        const { query : usernameSearchQuery } = req.params as {query : string};

        const foundUsers : TUserProfile[] = await searchUserService(usernameSearchQuery, req.user!.id);
        res.status(200).json({success : true, foundUsers});
        
    } catch (error) {
        return next(error);
    }
});

export const followUser = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {
    try {
        const { id : userIdToFollow } = req.params as {id : string};
        const loggedInUser : TInferSelectUserNoPass = req.user!;

        const followMessage : string = await followUserService(loggedInUser, userIdToFollow);
        res.status(200).json({success : true, message : followMessage});
        
    } catch (error) {
        return next(error);
    }
});

export const getUserProfile = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {
    try {
        const loggedInUser : TUserProfile = req.user!;
        const { currentUserProfile, followersCount, followingCount } = await getUserProfileService(loggedInUser as TUserProfile);
        res.status(200).json({success : true, user : currentUserProfile, followersCount, followingCount});
        
    } catch (error) {
        return next(error);
    }
});

export const updateAccountInfo = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {
    try {
        const { email, username } = req.body as TInferSelectUserNoPass;
        const loggedInUser  : TUserProfile = req.user!;

        const updatedUserInfo : TInferUpdateUser | undefined = await updateAccountInfoService(loggedInUser, email, username);
        res.status(200).json({success : true, updateResult : updatedUserInfo || []});
        
    } catch (error) {
        return next(error);
    }
});

export const updateAccountPassword = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {
    try {
        const { newPassword, oldPassword } = req.body as {newPassword : string, oldPassword : string};
        const loggedInUserId : string = req.user!.id;

        const updatePasswordMessage : string = await updateAccountPasswordService(loggedInUserId, newPassword, oldPassword);
        res.status(200).json({success : true, message : updatePasswordMessage});
        
    } catch (error) {
        return next(error);
    }
});