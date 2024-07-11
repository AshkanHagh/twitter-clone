import type { Request, Response, NextFunction } from 'express';
import { CatchAsyncError } from '../middlewares/catchAsyncError';
import { addTagToPostService } from '../services/tags.service';

export const addTagToPost = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {
    try {
        const { tags } = req.body as {tags : string[]};
        const { postId } = req.params as {postId : string};
        const currentUserId : string = req.user!.id;

        const message : string = await addTagToPostService(currentUserId, postId, tags);
        res.status(200).json({success : true, message});
        
    } catch (error) {
        return next(error);
    }
});