import { eq } from 'drizzle-orm';
import type { TInferSelectReplies, TPostCommentWithAuthor, TSelectComment } from '../../types/types';
import { db } from '../db';
import { CommentTable, PostCommentTable, RepliesTable } from '../schema';
import { ForbiddenError, ResourceNotFoundError } from '../../libs/utils';
import { createTransaction } from '../../libs/utils/createTransaction';
import { getHashWithIndexCache } from '../cache/index.cache';

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

export const insertReplay = async (currentUserId : string, commentId : string, replayText : string) : Promise<TInferSelectReplies> => {
    const comment : TSelectComment | undefined =  
    await db.query.CommentTable.findFirst({where : (table, funcs) => funcs.eq(table.id, commentId)});
    if(!comment) throw new ResourceNotFoundError();

    const [newReplay] : TInferSelectReplies[] = await db.insert(RepliesTable).values({
        authorId : currentUserId, commentId, text : replayText}).returning();
    return newReplay;
}

const checkReplayAuthor = async (currentUserId : string, commentId : string, replayId : string) => {
    let replayToModify : TInferSelectReplies | undefined;

    const replayToModifyCache : TInferSelectReplies | undefined = JSON.parse(await getHashWithIndexCache(`comment_replies:${commentId}`, replayId));
    replayToModify = replayToModifyCache;

    if(!replayToModifyCache || Object.keys(replayToModifyCache).length == 0) {
        replayToModify = await db.query.RepliesTable.findFirst({where : (table, funcs) => funcs.eq(table.id, replayId)});
    }
    if(replayToModify!.authorId !== currentUserId) throw new ForbiddenError();
}

export const updateReplay = async (currentUserId : string, commentId : string, replayId : string, replayText : string) : 
Promise<TInferSelectReplies> => {
    await checkReplayAuthor(currentUserId, commentId, replayId);

    const [updatedReplay] : TInferSelectReplies[] = 
    await db.update(RepliesTable).set({text : replayText}).where(eq(RepliesTable.id, replayId)).returning();
    return updatedReplay;
}

export const deleteReplay = async (currentUserId : string, commentId : string, replayId : string) => {
    await checkReplayAuthor(currentUserId, commentId, replayId);
    await db.delete(RepliesTable).where(eq(RepliesTable.id, replayId));
}

export const findAllReplies = async (commentId : string, limit : number, offset : number) => {
    return await db.query.RepliesTable.findMany({
        where : (table, funcs) => funcs.eq(table.commentId, commentId),
        with : {author : {columns : {password : false}, with : {profile : {columns : {profilePic : true}}}}}, limit, offset
    });
}