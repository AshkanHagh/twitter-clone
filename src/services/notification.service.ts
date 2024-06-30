import type { TErrorHandler, TInferSelectNotification, TNotificationResult, TUserProfile } from '../types/types';
import { deleteListCache, getAllFromHashCache } from '../database/cache/index.cache';
import { deleteNotifications, findManyNotifications } from '../database/queries/notification.query';
import { notificationEventEmitter } from '../events/notification.event';
import { ResourceNotFoundError } from '../libs/utils';
import ErrorHandler from '../libs/utils/errorHandler';
import { getAndUpdateListCache } from '../database/cache/notification.cache';

export const getNotificationsService = async (currentUserId : string) : Promise<(TNotificationResult | TInferSelectNotification)[]> => {
    try {
        let notifications : (TNotificationResult | TInferSelectNotification)[];

        const cachedNotifications : string[] = await getAndUpdateListCache(`notification:${currentUserId}`);
        if(cachedNotifications.length <= 0) notifications = await findManyNotifications(currentUserId);
        
        notifications = await Promise.all(cachedNotifications.map(async notification => {
            const notificationData : TInferSelectNotification = JSON.parse(notification);
            const userProfile : TUserProfile = await getAllFromHashCache(`user:${notificationData.from}`);

            return combineNotificationToUser(userProfile, notificationData);
        }));
        if(notifications.length <= 0) throw new ResourceNotFoundError();
        notificationEventEmitter.emit('read', currentUserId);
        return notifications;
        
    } catch (err) {
        const error = err as TErrorHandler;
        throw new ErrorHandler(`An error occurred : ${error.message}`, error.statusCode);
    }
}

export const clearNotificationsService = async (currentUserId : string) : Promise<string> => {
    try {
        await deleteNotifications(currentUserId);
        await deleteListCache(`notification:${currentUserId}`);
        notificationEventEmitter.emit('clear', currentUserId);
        return 'Notifications Cleared';
        
    } catch (err) {
        const error = err as TErrorHandler;
        throw new ErrorHandler(`An error occurred : ${error.message}`, error.statusCode);
    }
}

export const combineNotificationToUser = (user : TUserProfile, notification : TInferSelectNotification) : TNotificationResult => {
    const { to, type, read, createdAt, updatedAt } = notification;
    return {
        from : {username : user.username, profilePic : user.profilePic}, to, type, read, createdAt, updatedAt
    }
}