import type { Request, Response, NextFunction } from 'express';
import { CatchAsyncError } from '../middlewares/catchAsyncError';
import type { TFixedPostComment, TInferSelectReplies, TSelectComment } from '../types/index.type';
import { addCommentService, addReplayService, commentRepliesService, deleteCommentService, deleteReplayService, editCommentService, editReplayService, postCommentsService } from '../services/comment.service';

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
        const { limit, startIndex } = req.query as {limit : string, startIndex : string};
        const { postId } = req.params as {postId : string};

        const comments : TFixedPostComment[] = await postCommentsService(postId, +limit || undefined, +startIndex || undefined);
        res.status(200).json({success : true, comments});
        
    } catch (error) {
        return next(error);
    }
});

export const addReplay = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {
    try {
        const { commentId } = req.params as {commentId : string};
        const { text } = req.body as {text : string};
        const currentUserId : string = req.user!.id;

        const newReplay : TInferSelectReplies = await addReplayService(commentId, currentUserId, text);
        res.status(200).json({success : true, replay : newReplay});
        
    } catch (error) {
        return next(error);
    }
});

export const editReplay = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {
    try {
        const { replayId, commentId } = req.params as {replayId : string, commentId : string};
        const { text } = req.body as {text : string};
        const currentUserId : string = req.user!.id;

        const updatedReplay : TInferSelectReplies = await editReplayService(currentUserId, commentId, replayId, text);
        res.status(200).json({success : true, replay : updatedReplay});
        
    } catch (error) {
        return next(error);
    }
});

export const deleteReplay = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {
    try {
        const { replayId, commentId } = req.params as {replayId : string, commentId : string};
        const currentUserId : string = req.user!.id;

        const message : string = await deleteReplayService(currentUserId, commentId, replayId);
        res.status(200).json({success : true, message});
        
    } catch (error) {
        return next();
    }
});

export const commentReplies = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {
    try {
        const { startIndex, limit } = req.query as {startIndex : string, limit : string};
        const { commentId } = req.params as {commentId : string};

        const replies = await commentRepliesService(commentId, +startIndex, +limit);
        res.status(200).json({success : true, replies});
        
    } catch (error) {
        return next(error);
    }
});