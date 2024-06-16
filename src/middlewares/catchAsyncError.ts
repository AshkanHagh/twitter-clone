import type { NextFunction, Request, Response } from 'express';

type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

export const CatchAsyncError = (theFunc : AsyncRequestHandler) => (req : Request, res : Response, next : NextFunction) => {
    Promise.resolve(theFunc(req, res, next)).catch(next);
}