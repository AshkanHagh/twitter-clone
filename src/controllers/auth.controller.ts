import type { Request, Response, NextFunction } from 'express';
import { CatchAsyncError } from '../middlewares/catchAsyncError';
import type { TActivationToken, TInferSelectUser } from '../@types';
import { loginService, refreshTokenService, registerService, verifyAccountService } from '../services/auth.service';
import { sendToken } from '../libs/utils';
import { deleteFromCache } from '../database/cache';

export const register = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {
    try {
        const { username, email, password } = req.body as TInferSelectUser;
        const token : string = await registerService(username, email, password);
        res.status(200).json({success : true, activationToken : token});
        
    } catch (error) {
        return next(error);
    }
});

export const verifyAccount = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {
    try {
        const { activationCode, activationToken } = req.body as TActivationToken;
        await verifyAccountService(activationToken, activationCode);
        res.status(200).json({success : true, message : 'You can login now'});
        
    } catch (error : any) {
        return next(error);
    }
});

export const login = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {
    try {
        const { email, username , password } = req.body as TInferSelectUser;
        const user : TInferSelectUser = await loginService(email, username, password);

        const { accessToken, user : others} = sendToken(user, res, 'login');
        res.status(200).json({success : true, user : others, accessToken});
        
    } catch (error) {
        return next(error);
    }
});

export const logout = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {
    try {
        res.cookie('access_token', '', {maxAge : 1});
        res.cookie('refresh_token', '', {maxAge : 1});

        await deleteFromCache(`user:${req.user!.id}`);
        res.status(200).json({success : true, message : 'Logged out successfully'});
        
    } catch (error) {
        return next(error);
    }
});

export const refreshToken = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {
    try {
        const refreshToken : string = req.cookies.refresh_token;
        const user : TInferSelectUser = await refreshTokenService(refreshToken);

        req.user = user;
        const { accessToken } = sendToken(user, res, 'refresh');
        res.status(200).json({success : true, accessToken});
        
    } catch (error) {
        return next(error);
    }
});