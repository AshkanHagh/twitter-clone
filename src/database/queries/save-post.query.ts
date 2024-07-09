import { and, eq } from 'drizzle-orm';
import { db } from '../db';
import { SavePostTable } from '../schema';
import type { TInferSelectSavePost } from '../../types/index.type';
import { getHashWithIndexCache } from '../cache/index.cache';
import { ResourceNotFoundError } from '../../libs/utils';

export const insertSavePost = async (postId : string, currentUserId : string) : Promise<void> => {
    const postCache : {id : string} = await getHashWithIndexCache(`post:${postId}`, 'id');
    if(!postCache || Object.keys(postCache).length == 0) throw new ResourceNotFoundError();
    await db.insert(SavePostTable).values({postId, userId : currentUserId})
}

export const findFirstSave = async (postId : string, currentUserId : string) : Promise<TInferSelectSavePost> => {
    return await db.query.SavePostTable.findFirst({
        where : (table, funcs) => funcs.and(funcs.eq(table.postId, postId), funcs.eq(table.userId, currentUserId))
    }) as TInferSelectSavePost;
}

export const deleteSave = async (postId : string, currentUserId : string) : Promise<void> => {
    await db.delete(SavePostTable).where(and(eq(SavePostTable.postId, postId), eq(SavePostTable.userId, currentUserId)));
}

export const findManySavedPostsId = async (currentUserId : string) => {
    return await db.query.SavePostTable.findMany({where : (table, funcs) => funcs.eq(table.userId, currentUserId), columns : {postId : true}})
}