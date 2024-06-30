import { and, eq } from 'drizzle-orm';
import type { TInferSelectPost, TPostWithRelations } from '../../types/types';
import { db } from '../db';
import { PostLikeTable, PostTable } from '../schema';

export const insertPost = async (currentUserId : string, text : string, image : string | undefined) => {
    const createdPost = await db.insert(PostTable).values({userId : currentUserId, text, image : image || undefined}).returning();
    return createdPost[0] as TInferSelectPost;
}

export const findManyPosts = async () => {
    return await db.query.PostTable.findMany({
        with : {
            user : {columns : {password : false}},
            likes : {with : {user : true}, columns : {postId : false, userId : false}},
            comments : {with : {comment : true}, columns : {commentId : false, postId : false}},
            tags : {columns : {postId : false}}
        }
    }) as TPostWithRelations[];
}

export const findSuggestedPosts = async (postsId : string[]) => {
    return await db.query.PostTable.findMany({
        where: (table, funcs) => funcs.inArray(table.id, postsId),
        with : {
            user : {columns : {password : false}},
            likes : {with : {user : true}, columns : {postId : false, userId : false}},
            comments : {with : {comment : true}, columns : {commentId : false, postId : false}},
            tags : {columns : {postId : false}}
        }
    }) as TPostWithRelations[];
}

export const findFirstPost = async (postId : string) => {
    return await db.query.PostTable.findFirst({
        where : (table, funcs) => funcs.eq(table.id, postId),
        with : {
            user : {columns : {password : false}},
            likes : {with : {user : true}, columns : {postId : false, userId : false}},
            comments : {with : {comment : true}, columns : {commentId : false, postId : false}},
            tags : {columns : {postId : false}}
        }
    }) as TPostWithRelations;
}

export const findFirstLike = async (currentUserId : string, postId : string) => {
    return await db.query.PostLikeTable.findFirst({
        where : (table, funcs) => funcs.and(funcs.eq(table.postId, postId), funcs.eq(table.userId, currentUserId))
    });
}

export const findManyPostByUserId = async (userId : string) => {
    return await db.query.PostTable.findMany({
        where : (table, funcs) => funcs.eq(table.userId, userId),
        with : {
            user : {columns : {password : false}},
            likes : {with : {user : true}, columns : {postId : false, userId : false}},
            comments : {with : {comment : true}, columns : {commentId : false, postId : false}},
            tags : {columns : {postId : false}}
        },
        // limit : 5,
        orderBy : (table, funcs) => funcs.asc(table.createdAt)
    }) as TPostWithRelations[];
}

export const insertLikePost = async (userId : string, postId : string) => {
    await db.insert(PostLikeTable).values({userId, postId})
}

export const deleteLikePost = async (userId : string, postId : string) => {
    await db.delete(PostLikeTable).where(and(eq(PostLikeTable.userId, userId), eq(PostLikeTable.postId, postId)));
}