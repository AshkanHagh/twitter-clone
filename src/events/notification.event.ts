import { EventEmitter } from 'node:events';
import { deleteNotifications, insertNotification, updateNotification } from '../database/queries/notification.query';
import { addToListCache } from '../database/cache/index.cache';

export const notificationEventEmitter = new EventEmitter();

notificationEventEmitter.on('follow', async (from : string, to : string) => {
    const notification = await insertNotification(from, to, 'follow');
    await addToListCache(`notification:${to}`, notification, 604800);
});

notificationEventEmitter.on('clear', async (currentUserId : string) => {
    await deleteNotifications(currentUserId);
});

notificationEventEmitter.on('read', async (currentUserId : string) => {
    await updateNotification(currentUserId);
});