import jwt, { type JwtPayload } from 'jsonwebtoken';
import { CatchAsyncError } from './catchAsyncError';
import type { NextFunction, Request, Response } from 'express';
import ErrorHandler from '../libs/utils/errorHandler';
import { AccessTokenInvalidError, LoginRequiredError, RoleForbiddenError } from '../libs/utils';
import type { TErrorHandler, TInferSelectUserNoPass } from '../types/index.type';
import { getAllFromHashCache } from '../database/cache/index.cache';

export const isAuthenticated = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {
    try {
        const authHeader : string | undefined = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith('Bearer ')) return next(new LoginRequiredError());

        const accessToken : string | undefined = authHeader.split(' ')[1];
        if(!accessToken) return next(new AccessTokenInvalidError());

        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN as string) as JwtPayload & TInferSelectUserNoPass;
        if(!decoded) return next(new AccessTokenInvalidError());

        const user : TInferSelectUserNoPass = await getAllFromHashCache(`user:${decoded.id}`);
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