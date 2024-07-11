import { addSetList, getAllFromHashCache, getAllSetListCache, getFromSetListCache, removeFromSetList } from '../database/cache/index.cache';
import { findFirstPostWithPostId } from '../database/queries/post.query';
import { deleteSave, findFirstSave, findManySavedPostsId, insertSavePost } from '../database/queries/save-post.query';
import ErrorHandler from '../libs/utils/errorHandler';
import type { TErrorHandler, TInferSelectSavePost, TPostWithRelations } from '../types/index.type';
import { parseAndFixCacheResult } from './post.service';

export const savePostService = async (currentUserId : string, postId : string) : Promise<string> => {
    try {
        let alreadySaved : TInferSelectSavePost | number;

        const currentUserSetListCache = await getFromSetListCache(`user:${currentUserId}:savedPosts`, postId);
        if(!currentUserSetListCache) alreadySaved = await findFirstSave(postId, currentUserId);
        
        alreadySaved = currentUserSetListCache;
        if(!alreadySaved) {
            await insertSavePost(postId, currentUserId);
            await addSetList(`user:${currentUserId}:savedPosts`, postId);
    
            return 'Post has been saved successfully';
        }
        await deleteSave(postId, currentUserId);
        await removeFromSetList(`user:${currentUserId}:savedPosts`, postId);
        
        return 'Post has been unsaved successfully'

    } catch (err : unknown) {
        const error = err as TErrorHandler;
        throw new ErrorHandler(`An error occurred : ${error.message}`, error.statusCode);
    }
}

export const savedPostsService = async (currentUserId : string) : Promise<TPostWithRelations[]> => {
    let savedPostsId : string[];
    
    const savedPostsIdCache : string[] = await getAllSetListCache(`user:${currentUserId}:savedPosts`);
    savedPostsId = savedPostsIdCache;

    if(!savedPostsIdCache) {
        const savedPostIdDB : {postId : string}[] = await findManySavedPostsId(currentUserId);
        savedPostsId = savedPostIdDB.map(post => post.postId);
    }

    const savedPosts : TPostWithRelations[] = await Promise.all(savedPostsId.map(async postId => {
        let savedPosts : TPostWithRelations;

        const savedPostCache : TPostWithRelations = parseAndFixCacheResult(await getAllFromHashCache(`post:${postId}`));
        savedPosts = savedPostCache;
        if(!savedPostCache || Object.keys(savedPostCache).length == 0) savedPosts = await findFirstPostWithPostId(postId);

        return savedPosts;
    }))
    return savedPosts;
}