import { eq } from 'drizzle-orm';
import type { TPostCommentWithAuthor, TSelectComment } from '../../types/types';
import { db } from '../db';
import { CommentTable, PostCommentTable } from '../schema';
import { ForbiddenError } from '../../libs/utils';

export const insertComment = async (authorId : string, postId : string, text : string) : Promise<TSelectComment> => {
    const newComment : TSelectComment[] = await db.insert(CommentTable).values({authorId, text}).returning();
    const comment : TSelectComment = newComment[0];

    await db.insert(PostCommentTable).values({postId, commentId : comment.id});
    return comment
}

export const updateComment = async (commentId : string, currentUserId : string, text : string) : Promise<TSelectComment> => {
    const comment = await findFirstComment(commentId);
    if(comment.authorId !== currentUserId) throw new ForbiddenError();
    const updatedComment = await db.update(CommentTable).set({text}).where(eq(CommentTable.id, commentId)).returning();

    return updatedComment[0];
}

export const findFirstComment = async (commentId : string) : Promise<TSelectComment> => {
    return await db.query.CommentTable.findFirst({where : (table, funcs) => funcs.eq(table.id, commentId)}) as TSelectComment;
}

export const deleteFirstComment = async (commentId : string, currentUserId : string) : Promise<void> => {
    const comment = await findFirstComment(commentId);
    if(comment.authorId !== currentUserId) throw new ForbiddenError();
    await db.delete(CommentTable).where(eq(CommentTable.id, commentId));
}

export const findManyCommentsByPostId = async (postId : string) : Promise<TPostCommentWithAuthor[]> => {
    return await db.query.PostCommentTable.findMany({
        where : (table, funcs) => funcs.eq(table.postId, postId), 
        with : {
            comment : {with : {author : {with : {profile : {columns : {profilePic : true}}}, columns : {username : true}}}}
        }, columns : {postId : false, commentId : false}
    });
}