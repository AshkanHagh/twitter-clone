import type { Request, Response, NextFunction } from 'express';
import { CatchAsyncError } from '../middlewares/catchAsyncError';
import type { TInferSelectPost, TInferSelectUserNoPass, TModifiedFollowingsPost, TPostWithRelations } from '../types/index.type';
import { createPostService, editPostService, suggestedPostsService, likePostService, deletePostService, getFollowingPosts } from '../services/post.service';

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

export const suggestedPosts = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {
    try {
        const posts : TPostWithRelations[] = await suggestedPostsService(req.user!.id as string);
        res.status(200).json({success : true, posts});
        
    } catch (error) {
        return next(error);
    }
});

export const likePost = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {
    try {
        const { id : postId } = req.params as {id : string};
        const currentUserId : string = req.user!.id;

        const message : string = await likePostService(currentUserId, postId);
        res.status(200).json({success : true, message});
        
    } catch (error) {
        return next(error);
    }
});

export const editPost = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {
    try {
        const { id : postId } = req.params as {id : string};
        const currentUserId : string = req.user!.id;
        const { image, text } = req.body as TInferSelectPost;

        const updatedPost : TInferSelectPost = await editPostService(currentUserId, postId, image, text);
        res.status(200).json({success : true, updatedPost});
        
    } catch (error) {
        return next(error);
    }
});

export const deletePost = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {
    try {
        const { id : postId } = req.params as {id : string};
        const currentUserId : string = req.user!.id;

        const message : string = await deletePostService(postId, currentUserId);
        res.status(200).json({success : true, message});
        
    } catch (error) {
        return next(error);
    }
});

export const followedUsersPosts = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {
    try {
        const currentUserId : string = req.user!.id;
        const posts : TModifiedFollowingsPost[] = await getFollowingPosts(currentUserId);
        res.status(200).json({success : true, posts});
        
    } catch (error) {
        return next(error);
    }
});