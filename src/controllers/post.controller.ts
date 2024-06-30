import type { Request, Response, NextFunction } from 'express';
import { CatchAsyncError } from '../middlewares/catchAsyncError';
import type { TInferSelectPost, TInferSelectUserNoPass } from '../types/types';
import { createPostService, getPostsService, postLikeService } from '../services/post.service';

export const createPost = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {
    try {
        const { text, image } = req.body as TInferSelectPost;
        const currentUser : TInferSelectUserNoPass = req.user!;
        const result = await createPostService(currentUser, text, image || undefined);
        res.status(200).json({success : true, result});
        
    } catch (error) {
        return next(error);
    }
});

export const getPosts = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {
    try {
        const posts = await getPostsService(req.user!.id);
        res.status(200).json({success : true, posts});
        
    } catch (error) {
        return next(error);
    }
});

export const likePost = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {
    try {
        const { id : postId } = req.params as {id : string};
        const currentUserId = req.user!.id;

        const result = await postLikeService(currentUserId, postId);
        res.status(200).json({success : true, result});
        
    } catch (error) {
        return next(error);
    }
})