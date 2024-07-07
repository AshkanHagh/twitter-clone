import { eq } from 'drizzle-orm';
import type { TPostCommentWithAuthor, TSelectComment } from '../../types/types';
import { db } from '../db';
import { CommentTable, PostCommentTable } from '../schema';
import { ForbiddenError, ResourceNotFoundError } from '../../libs/utils';
import { createTransaction } from '../../libs/utils/createTransaction';

export const insertComment = async (authorId : string, postId : string, text : string) : Promise<TSelectComment> => {
    const newComment = await db.transaction(async (trx) => {
        const [newComment] = await trx.insert(CommentTable).values({authorId, text}).returning();
        await trx.insert(PostCommentTable).values({postId, commentId : newComment.id});
        return newComment; 
    });
    return newComment;
}

export const updateComment = async (commentId : string, currentUserId : string, text : string) : Promise<TSelectComment> => {
    const updatedComment = await db.transaction(async (trx) => {
        await findFirstComment(commentId, currentUserId, trx);
        const [updatedComment] = await trx.update(CommentTable).set({text}).where(eq(CommentTable.id, commentId)).returning();
        return updatedComment;
    })
    return updatedComment;
}

export const findFirstComment = async (commentId : string, currentUserId : string, trx = db) : Promise<TSelectComment> => {
    const comment : TSelectComment | undefined = await trx.query.CommentTable.findFirst({
        where : (table, funcs) => funcs.eq(table.id, commentId)
    });
    if(!comment) throw new ResourceNotFoundError();
    if(comment.authorId !== currentUserId) throw new ForbiddenError();
    return comment;
}

export const deleteFirstComment = async (commentId : string, currentUserId : string) : Promise<void> => {
    createTransaction(async (trx) => {
        await findFirstComment(commentId, currentUserId, trx);
        await trx.delete(CommentTable).where(eq(CommentTable.id, commentId));
    })
}

export const findManyCommentsByPostId = async (postId : string, limit : number | undefined, offset : number | undefined) :
Promise<TPostCommentWithAuthor[]> => {
    return await db.query.PostCommentTable.findMany({
        where : (table, funcs) => funcs.eq(table.postId, postId), 
        with : {
            comment : {with : {author : {with : {profile : {columns : {profilePic : true}}}, columns : {username : true}}}}
        }, columns : {postId : false, commentId : false}, limit : limit || 15, offset
    });
}

export const findManyComments = async (currentUserId : string) : Promise<{id : string}[]> => {
    return await db.query.CommentTable.findMany({
        where : (table, funcs) => funcs.eq(table.authorId, currentUserId), columns : {id : true}
    })
}