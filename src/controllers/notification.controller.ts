import type { Request, Response, NextFunction } from 'express';
import { CatchAsyncError } from '../middlewares/catchAsyncError';
import { clearNotificationsService, getNotificationsService } from '../services/notification.service';
import type { TInferSelectNotification, TNotificationResult } from '../types/index.type';

export const getNotifications = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {
    try {
        const currentUserId : string = req.user!.id;
        const notifications : (TNotificationResult | TInferSelectNotification)[] = await getNotificationsService(currentUserId);
        res.status(200).json({success : true, notifications});
        
    } catch (error) {
        return next(error);
    }
});

export const clearNotifications = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {
    try {
        const currentUserId : string = req.user!.id;
        const message : string = await clearNotificationsService(currentUserId);
        res.status(200).json({success : true, message});
        
    } catch (error) {
        return next(error);
    }
});