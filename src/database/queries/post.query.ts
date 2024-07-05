import { and, eq } from 'drizzle-orm';
import type { TInferSelectPost, TInferSelectPostLike, TPostWithRelations } from '../../types/types';
import { db } from '../db';
import { PostLikeTable, PostTable } from '../schema';

export const insertPost = async (currentUserId : string, text : string, image : string | undefined) : Promise<TInferSelectPost> => {
    const createdPost = await db.insert(PostTable).values({userId : currentUserId, text, image : image || undefined}).returning();
    return createdPost[0] as TInferSelectPost;
}

export const findManyPosts = async () : Promise<TPostWithRelations[]> => {
    return await db.query.PostTable.findMany({
        with : {
            user : {columns : {password : false}},
            likes : {with : {user : true}, columns : {postId : false, userId : false}},
            comments : {with : {comment : true}, columns : {commentId : false, postId : false}},
            tags : {columns : {postId : false}}
        }
    }) as TPostWithRelations[];
}

export const findSuggestedPosts = async (postsId : string[]) : Promise<TPostWithRelations[]> => {
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

export const findFirstPostWithPostId = async (postId : string) : Promise<TPostWithRelations> => {
    return await db.query.PostTable.findFirst({
        where : (table, funcs) => funcs.eq(table.id, postId),
        with : {
            user : {columns : {password : false}},
            likes : {with : {user : true}, columns : {postId : false, userId : false}},
            comments : {with : {comment : true}, columns : {commentId : false, postId : false}},
            tags : {columns : {postId : false}}
        }, orderBy : (table, funcs) => funcs.desc(table.createdAt)
    }) as TPostWithRelations;
}

export const findFirstPostWithUserId = async (userId : string) : Promise<TPostWithRelations> => {
    return await db.query.PostTable.findFirst({
        where : (table, funcs) => funcs.eq(table.userId, userId),
        with : {
            user : {columns : {password : false}},
            likes : {with : {user : true}, columns : {postId : false, userId : false}},
            comments : {with : {comment : true}, columns : {commentId : false, postId : false}},
            tags : {columns : {postId : false}}
        }
    }) as TPostWithRelations;
}

export const findFirstLike = async (currentUserId : string, postId : string) : Promise<TInferSelectPostLike> => {
    return await db.query.PostLikeTable.findFirst({
        where : (table, funcs) => funcs.and(funcs.eq(table.postId, postId), funcs.eq(table.userId, currentUserId))
    }) as TInferSelectPostLike;
}

export const findManyPostByUserId = async (userId : string) : Promise<TPostWithRelations[]> => {
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

export const insertLikePost = async (userId : string, postId : string) : Promise<void> => {
    await db.insert(PostLikeTable).values({userId, postId})
}

export const deleteLikePost = async (userId : string, postId : string) : Promise<void> => {
    await db.delete(PostLikeTable).where(and(eq(PostLikeTable.userId, userId), eq(PostLikeTable.postId, postId)));
}

export const updatePost = async (postId : string, values : {text : string, image : string}) : Promise<TInferSelectPost> => {
    const updatedPost = await db.update(PostTable).set(values).where(eq(PostTable.id, postId)).returning();
    return updatedPost[0] as TInferSelectPost;
}

export const deleteFirstPost = async (postId : string) : Promise<void> => {
    await db.delete(PostTable).where(eq(PostTable.id, postId));
}

export const getPostCreatorAndId = async (postId : string) : Promise<{userId : string, id : string} | undefined> => {
    return await db.query.PostTable.findFirst({where : (table, funcs) => funcs.eq(table.id, postId), columns : {userId : true, id : true}});
}

export const findManyLikes = async (currentUserId : string) : Promise<TInferSelectPostLike[]> => {
    return await db.query.PostLikeTable.findMany({
        where : (table, funcs) => funcs.eq(table.userId, currentUserId)
    })
}