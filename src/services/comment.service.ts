import { addHashListCache, addToListWithScore, getAllFromHashCache, getHashWithIndexCache, removeFromHashListCache } from '../database/cache/index.cache';
import { deleteFirstComment, findManyCommentsByPostId, insertComment, updateComment } from '../database/queries/comment.query';
import { getPostCreatorAndId } from '../database/queries/post.query';
import { postEventEmitter } from '../events/post.event';
import { ResourceNotFoundError } from '../libs/utils';
import ErrorHandler from '../libs/utils/errorHandler';
import type { TErrorHandler, TFixedPostComment, TPostCommentWithAuthor, TPostWithRelations, TSelectComment } from '../types/types';
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
// DONE Add transaction and dependency injection to all queries in project
// 2. Add like And Replay crud to comments
// DONE Use caching to boost performance comment functions
export const postCommentsService = async (postId : string, limit : number | undefined, startIndex : number | undefined) 
: Promise<TFixedPostComment[]> => {
    try {
        const postComments : TPostCommentWithAuthor[] = await findManyCommentsByPostId(postId, limit, startIndex);
        const modifiedPostComments : TFixedPostComment[] = postComments.map(comment => {
            return {
                id : comment.comment.id,
                authorId : comment.comment.authorId, text : comment.comment.text, createdAt : comment.comment.createdAt,
                author : {
                    username : comment.comment.author.username,
                    profilePic : comment.comment.author.profile?.profilePic
                }
            }
        }).sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
        postEventEmitter.emit('post_cache', postId)
        return modifiedPostComments;
        
    } catch (err) {
        const error = err as TErrorHandler;
        throw new ErrorHandler(`An error occurred : ${error.message}`, error.statusCode);
    }
}