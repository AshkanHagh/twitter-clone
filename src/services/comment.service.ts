import { addHashListCache, addToListWithScore, getAllFromHashCache, getHashWithIndexCache, 
removeFromHashListCache } from '../database/cache/index.cache';
import { deleteFirstComment, deleteReplay, findManyCommentsByPostId, insertComment, insertReplay, findAllReplies, updateComment, 
updateReplay } from '../database/queries/comment.query';
import { getPostCreatorAndId } from '../database/queries/post.query';
import { postEventEmitter } from '../events/post.event';
import { ResourceNotFoundError } from '../libs/utils';
import ErrorHandler from '../libs/utils/errorHandler';
import type { TErrorHandler, TFixedCommentReplies, TFixedPostComment, TInferSelectReplies, TPostCommentWithAuthor, TPostWithRelations, 
    TRepliesRelations, TSelectComment, TUserProfile } from '../types/types';
import { calculateNumberOfSuggestions } from './post.service';

export const addCommentService = async (postId : string, currentUserId : string, text : string) : Promise<TSelectComment> => {
    try {
        let desiredPost : {userId : string, id : string} | undefined;
        const desiredPostCache : string = await getHashWithIndexCache(`post:${postId}`, 'userId');
        desiredPost = {id : postId, userId : desiredPostCache};

        if(!desiredPostCache) desiredPost = await getPostCreatorAndId(postId);
        if(!desiredPost) throw new ResourceNotFoundError();

        const newComment : TSelectComment = await insertComment(currentUserId, postId, text);
        const suggestionCount = await calculateNumberOfSuggestions(currentUserId, postId, 'other', 0.1);

        await Promise.all([
            addHashListCache(`post_comments:${postId}`, newComment.id, newComment, 2419200),
            addToListWithScore(`suggest_post:${desiredPost.userId}`, suggestionCount, desiredPost.id),
        ]);
        
        postEventEmitter.emit('post_cache', postId)
        return newComment;
        
    } catch (err) {
        const error = err as TErrorHandler;
        throw new ErrorHandler(`An error occurred : ${error.message}`, error.statusCode);
    }
}

export const editCommentService = async (commentId : string, postId : string, currentUserId : string, text : string) : Promise<TSelectComment> => {
    try {
        const updatedComment : TSelectComment = await updateComment(commentId, currentUserId, text);
        addHashListCache(`post_comments:${postId}`, commentId, updatedComment, 2419200);
        postEventEmitter.emit('post_cache', postId);

        return updatedComment;
        
    } catch (err) {
        const error = err as TErrorHandler;
        throw new ErrorHandler(`An error occurred : ${error.message}`, error.statusCode);
    }
}

export const deleteCommentService = async (commentId : string, postId : string, currentUserId : string) : Promise<string> => {
    try {
        await deleteFirstComment(commentId, currentUserId);
        const postToModify : TPostWithRelations = await getAllFromHashCache(`post:${postId}`);

        const suggestionCount = await calculateNumberOfSuggestions(currentUserId, postId, 'other', 0.1);
        await Promise.all([
            addToListWithScore(`suggest_post:${postToModify.userId}`, -suggestionCount, postToModify.id),
            removeFromHashListCache(`post_comments:${postId}`, commentId),
        ]);

        postEventEmitter.emit('post_cache', postId);
        return 'Comment has been deleted successfully';
        
    } catch (err) {
        const error = err as TErrorHandler;
        throw new ErrorHandler(`An error occurred : ${error.message}`, error.statusCode);
    }
}
// 1. Add pagination to cache comment
export const postCommentsService = async (postId : string, limit : number | undefined, startIndex : number | undefined) 
: Promise<TFixedPostComment[]> => {
    try {
        let postComments : TPostCommentWithAuthor[] | TFixedPostComment[];

        const postCommentsCache : Record<string, string> = await getAllFromHashCache(`post_comments:${postId}`);
        const parsedComments : TSelectComment[] = Object.values(postCommentsCache).map(comment => JSON.parse(comment));

        const commentWithAuthor : TFixedPostComment[] = await Promise.all(parsedComments.map(async comment => {
            const author : TUserProfile = await getAllFromHashCache(`user:${comment.authorId}`);
            return {...comment, author : {username : author.username, profilePic : author.profilePic}} as TFixedPostComment;
        }));

        postComments = commentWithAuthor;

        if(!postCommentsCache || Object.keys(postCommentsCache).length == 0) {
            postComments = await findManyCommentsByPostId(postId, limit, startIndex);
            const modifiedPostComments : TFixedPostComment[] = postComments.map(comment => {
                const { id, authorId, author, createdAt, text, updatedAt } = comment.comment;
                return {
                    id, authorId, createdAt, text, updatedAt,
                    author : {username :author.username, profilePic : author.profile?.profilePic}
                }
            });
            postEventEmitter.emit('post_cache', postId)
            return modifiedPostComments.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()).
            splice(startIndex || 0, limit || 10);
        }

        postEventEmitter.emit('post_cache', postId)
        return postComments.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
        
    } catch (err) {
        const error = err as TErrorHandler;
        throw new ErrorHandler(`An error occurred : ${error.message}`, error.statusCode);
    }
}

export const addReplayService = async (commentId : string, currentUserId : string, replayText : string) : Promise<TInferSelectReplies> => {
    try {
        const newReplay : TInferSelectReplies = await insertReplay(currentUserId, commentId, replayText);
        addHashListCache(`comment_replies:${commentId}`, newReplay.id, newReplay, 2419200);
        return newReplay;

    } catch (err) {
        const error = err as TErrorHandler;
        throw new ErrorHandler(`An error occurred : ${error.message}`, error.statusCode);
    }
}

export const editReplayService = async (currentUserId : string, commentId : string, replayId : string, replayText : string) : 
Promise<TInferSelectReplies> => {
    try {
        const updatedReplay : TInferSelectReplies = await updateReplay(currentUserId, commentId, replayId, replayText);
        addHashListCache(`comment_replies:${updatedReplay.commentId}`, replayId, updatedReplay, 2419200);
        return updatedReplay;
        
    } catch (err) {
        const error = err as TErrorHandler;
        throw new ErrorHandler(`An error occurred : ${error.message}`, error.statusCode);
    }
}

export const deleteReplayService = async (currentUserId : string, commentId : string, replayId : string) : Promise<string> => {
    try {
        await deleteReplay(currentUserId, commentId, replayId);
        removeFromHashListCache(`comment_replies:${commentId}`, replayId);
        return 'Replay Has been deleted successfully';
        
    } catch (err) {
        const error = err as TErrorHandler;
        throw new ErrorHandler(`An error occurred : ${error.message}`, error.statusCode);
    }
}
// 1. Add pagination to cache replay
export const commentRepliesService = async (commentId : string, startIndex : number, limit : number) : Promise<TFixedCommentReplies[]> => {
    try {
        let commentReplies : TRepliesRelations[] | TFixedCommentReplies[];

        const commentRepliesCache : Record<string, string> = await getAllFromHashCache(`comment_replies:${commentId}`);
        const parsedReplies : TInferSelectReplies[] = Object.values(commentRepliesCache).map(replay => JSON.parse(replay));

        const repliesWithAuthor : TFixedCommentReplies[] = await Promise.all(parsedReplies.map(async replay => {
            const author : TUserProfile = await getAllFromHashCache(`user:${replay.authorId}`);
            return {...replay, author : {username : author.username, profilePic : author.profilePic}} as TFixedCommentReplies
        }));
        commentReplies = repliesWithAuthor;

        if(!commentRepliesCache || Object.keys(commentRepliesCache).length == 0) {
            commentReplies = await findAllReplies(commentId, limit, startIndex);

            const modifiedCommentReplies : TFixedCommentReplies[] = commentReplies.map(replay => {
                const { id, commentId, authorId, createdAt, updatedAt, author } = replay;
                return {
                    id, commentId, authorId, createdAt, updatedAt,
                    author : {username : author.username, profilePic : author.profile?.profilePic}
                } as TFixedCommentReplies
            });
            return modifiedCommentReplies;
        }
        return commentReplies.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
        .splice(startIndex || 0, limit || 10);
        
    } catch (err) {
        const error = err as TErrorHandler;
        throw new ErrorHandler(`An error occurred : ${error.message}`, error.statusCode);
    }
}