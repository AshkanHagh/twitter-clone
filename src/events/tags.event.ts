import { EventEmitter } from 'node:events';
import type { TInferSelectTag } from '../types/index.type';
import { deleteTag, insertTag, updateTag } from '../database/queries/tags.query';

const tagsEventEmitter = new EventEmitter();

tagsEventEmitter.on('update_tags', async (currentPostTags : TInferSelectTag[], newTags : string[], newTagsSet : Set<string>, 
    currentUserId : string, postId : string) => {
    const existingTagsSet : Set<string> = new Set(currentPostTags.map(tag => tag.tag));   
    const tagsToAdd : string[] = newTags.filter(tag => !existingTagsSet.has(tag));
    const removedTags : TInferSelectTag[] = currentPostTags.filter(tagObj => !newTagsSet.has(tagObj.tag));
    const updatedTags : TInferSelectTag[] = currentPostTags.filter(tagObj => newTagsSet.has(tagObj.tag) && !newTags.includes(tagObj.tag));

    const addPromises : Promise<void>[] = tagsToAdd.map(tag => insertTag(currentUserId, postId, tag));
    const removePromises : Promise<void>[] = removedTags.map(tagObj => deleteTag(tagObj.id));
    const updatePromises : Promise<void>[] = updatedTags.map(tagObj => updateTag(tagObj.id, tagObj.tag));
    await Promise.all([...addPromises, ...removePromises, ...updatePromises]);
})

export default tagsEventEmitter;