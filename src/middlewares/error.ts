import type { NextFunction, Request, Response } from 'express';
import type { TErrorHandler } from '../@types';

export const ErrorMiddleware = (error: TErrorHandler, req: Request, res: Response, next: NextFunction) => {
    error.statusCode = error.statusCode || 500;
    error.message = error.statusCode == 500 ? 'Internal server error' : error.message;

    res.status(Number(error.statusCode)).json({success : false, message : error.message});
}