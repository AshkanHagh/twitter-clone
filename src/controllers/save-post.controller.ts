import type { Request, Response, NextFunction } from 'express';
import { CatchAsyncError } from '../middlewares/catchAsyncError';
import { savedPostsService, savePostService } from '../services/save-post.service';
import type { TPostWithRelations } from '../types/index.type';

export const savePost = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {
    try {
        const { postId } = req.params as {postId : string};
        const currentUserId : string = req.user!.id;

        const message : string = await savePostService(currentUserId, postId);
        res.status(200).json({success : true, message});
        
    } catch (error) {
        return next(error);
    }
});

export const savedPosts = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {
    try {
        const currentUserId : string = req.user!.id;
        const post : TPostWithRelations[] = await savedPostsService(currentUserId);
        res.status(200).json({success : true, post});
        
    } catch (error) {
        return next(error);
    }
});