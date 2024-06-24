import type { TInferSelectPost, TPostWithUser } from '../../@types';
import { db } from '../db';
import { PostTable } from '../schema';

export const insertPost = async (currentUserId : string, text : string, image : string | undefined) => {
    const createdPost = await db.insert(PostTable).values({userId : currentUserId, text, image : image || ''}).returning();
    return createdPost[0] as TInferSelectPost;
}

export const findSuggestedPosts = async (postsId : string[]) => {
    return await db.query.PostTable.findMany({
        where: (table, funcs) => funcs.inArray(table.id, postsId),
        with : {
            user : {columns : {id : false}},
            likes : {with : {user : true}, columns : {postId : false, userId : false}},
            comments : {with : {comment : true}, columns : {commentId : false, postId : false}},
            tags : {columns : {postId : false}}
        }
    }) as TPostWithUser[];
}

export const findFirstPost = async (postId : string) => {
    return await db.query.PostTable.findFirst({
        where : (table, funcs) => funcs.eq(table.id, postId), columns : {userId : true}
    }) as TPostWithUser;
}

export const findFirstLike = async (currentUserId : string, postId : string) => {
    return await db.query.PostLikeTable.findFirst({
        where : (table, funcs) => funcs.and(funcs.eq(table.postId, postId), funcs.eq(table.userId, currentUserId)),
        // with : {post : {columns : {id : true, userId : true}}}
    });
}

export const findManyPostByUserId = async (userId : string) => {
    return await db.query.PostTable.findMany({
        where : (table, funcs) => funcs.eq(table.userId, userId),
        with : {
            user : {columns : {id : false}},
            likes : {with : {user : true}, columns : {postId : false, userId : false}},
            comments : {with : {comment : true}, columns : {commentId : false, postId : false}},
            tags : {columns : {postId : false}}
        },
        limit : 5,
        orderBy : (table, funcs) => funcs.desc(table.createdAt)
    }) as TPostWithUser[];
}