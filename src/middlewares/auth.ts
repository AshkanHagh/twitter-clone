import jwt, { type JwtPayload } from 'jsonwebtoken';
import { CatchAsyncError } from './catchAsyncError';
import type { NextFunction, Request, Response } from 'express';
import ErrorHandler from '../libs/utils/errorHandler';
import { AccessTokenInvalidError, LoginRequiredError, RoleForbiddenError } from '../libs/utils';
import type { TErrorHandler, TInferSelectUser } from '../@types';
import { findInHashCache } from '../database/cache';

export const isAuthenticated = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {
    try {
        const accessToken : string = req.cookies.access_token;
        if(!accessToken) return next(new LoginRequiredError());

        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN as string) as JwtPayload & TInferSelectUser;
        if(!decoded) return next(new AccessTokenInvalidError());

        const user : Omit<TInferSelectUser, 'password'> = await findInHashCache(`user:${decoded.id}`);
        if(Object.keys(user).length <= 0) return next(new LoginRequiredError());

        req.user = user;
        next();
        
    } catch (err) {
        const error = err as TErrorHandler;
        return next(new ErrorHandler(`An error occurred : ${error.message}`, error.statusCode));
    }
});

export const authorizeRoles = (...role : string[]) => {
    return (req : Request, res : Response, next : NextFunction) => {
        if(!role.includes(req.user?.role || '')) {
            return next(new RoleForbiddenError(req.user?.role || 'unknown'));
        }
        next();
    }
}