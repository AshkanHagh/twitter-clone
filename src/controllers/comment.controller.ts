import type { Request, Response, NextFunction } from 'express';
import { CatchAsyncError } from '../middlewares/catchAsyncError';
import type { TFixedPostComment, TSelectComment } from '../types/types';
import { addCommentService, deleteCommentService, editCommentService, postCommentsService } from '../services/comment.service';

export const addComment = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {
    try {
        const { postId } = req.params as {postId : string};
        const { text } = req.body as {text : string};
        const currentUserId : string = req.user!.id;

        const newComment : TSelectComment = await addCommentService(postId, currentUserId, text);
        res.status(200).json({success : true, comment : newComment});
        
    } catch (error) {
        return next(error);
    }
});

export const editComment = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {
    try {
        const { postId, commentId } = req.params as {postId : string, commentId : string};
        const { text } = req.body as {text : string};
        const currentUserId : string = req.user!.id;

        const updatedComment : TSelectComment = await editCommentService(commentId, postId, currentUserId, text);
        res.status(200).json({success : true, comment : updatedComment});
        
    } catch (error) {
        return next(error);
    }
});

export const deleteComment = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {
    try {
        const { postId, commentId } = req.params as {postId : string, commentId : string};
        const currentUserId : string = req.user!.id;

        const message : string = await deleteCommentService(commentId, postId, currentUserId);
        res.status(200).json({success : true, message});
        
    } catch (error) {
        return next(error);
    }
});

export const postComments = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {
    try {
        const { postId } = req.params as {postId : string};

        const comments : TFixedPostComment[] = await postCommentsService(postId);
        res.status(200).json({success : true, comments});
        
    } catch (error) {
        return next(error);
    }
});