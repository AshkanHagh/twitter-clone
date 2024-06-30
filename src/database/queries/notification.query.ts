import type { TInferSelectNotification } from '../../types/types';
import { NotificationTable } from '../schema';
import { eq } from 'drizzle-orm';
import { db } from '../db';

export const insertNotification = async (from : string, to : string, type : 'follow' | 'like') : Promise<TInferSelectNotification> => {
    const notification = await db.insert(NotificationTable).values({from, to, type}).returning();
    return notification[0] as TInferSelectNotification;
}

export const updateNotification = async (currentUserId : string) => {
    await db.update(NotificationTable).set({read : true}).where(eq(NotificationTable.to, currentUserId));
}

export const findManyNotifications = async (currentUserId : string) : Promise<TInferSelectNotification[]> => {
    await updateNotification(currentUserId);
    return await db.query.NotificationTable.findMany({
        where : (table, funcs) => funcs.eq(table.to, currentUserId),
        with : {
            from : {with : {profile : {columns : {id : false, userId : false}}}},
            to : {with : {profile : {columns : {id : false, userId : false}}}}
        }
    }) as TInferSelectNotification[];
}

export const deleteNotifications = async (currentUserId : string) : Promise<void> => {
    await db.delete(NotificationTable).where(eq(NotificationTable.to, currentUserId));
}