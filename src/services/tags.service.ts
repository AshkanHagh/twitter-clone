import { findManyTags, insertTag } from '../database/queries/tags.query';
import tagsEventEmitter from '../events/tags.event';
import ErrorHandler from '../libs/utils/errorHandler';
import type { TErrorHandler, TInferSelectTag } from '../types/index.type';

export const addTagToPostService = async (currentUserId : string, postId : string, newTags : string[]) : Promise<string> => {
    try {
        const newTagsSet = new Set(newTags);
        const currentPostTags : TInferSelectTag[] = await findManyTags(postId);

        if(currentPostTags.length == 0) {
            for (const tag of newTagsSet) Promise.all([await insertTag(currentUserId, postId, tag)])
            return 'Tags has been added successfully';
        }

        tagsEventEmitter.emit('update_tags', currentPostTags, newTags, newTagsSet, currentUserId, postId)
        return 'Tags has been updated successfully';
        
    } catch (err : unknown) {
        const error = err as TErrorHandler;
        throw new ErrorHandler(`An error occurred : ${error.message}`, error.statusCode);
    }
}