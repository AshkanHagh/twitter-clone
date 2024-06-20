import { EventEmitter } from 'node:events';
import { insertNotification } from '../database/queries/notification.query';
import { insertListCache } from '../database/cache';

export const notificationEventEmitter = new EventEmitter();

notificationEventEmitter.on('follow', async (from : string, to : string) => {
    const notification = await insertNotification(from, to, 'follow');
    await insertListCache(`notification:${to}`, notification, 604800);
});