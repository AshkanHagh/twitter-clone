import { eq } from 'drizzle-orm';
import type { TInferSelectTag } from '../../types/index.type';
import { db } from '../db';
import { PostTagTable } from '../schema';
import { checkPostAuthor } from './post.query';

export const insertTag = async (currentUserId : string, postId : string, tag : string) : Promise<void> => {
    await checkPostAuthor(currentUserId, postId);
    await db.insert(PostTagTable).values({postId, tag});
}

export const findManyTags = async (postId : string) : Promise<TInferSelectTag[]> => {
    return await db.query.PostTagTable.findMany({where : (table, funcs) => funcs.eq(table.postId, postId)});
}

export const deleteTag = async (tagId : string) : Promise<void> => {
    await db.delete(PostTagTable).where(eq(PostTagTable.id, tagId));
}

export const updateTag = async (tagId : string, tag : string) : Promise<void> => {
    await db.update(PostTagTable).set({tag}).where(eq(PostTagTable.id, tagId));
}