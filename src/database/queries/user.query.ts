import { and, eq, sql } from 'drizzle-orm';
import type { TInferSelectFollowers, TInferSelectUser, TInferSelectUserProfile, TInferUpdateUser, TUpdateProfileInfo, 
    TUserWithProfileInfo } from '../../@types';
import { db } from '../db';
import { FollowersTable, UserProfileTable, UserTable } from '../schema';
import { escapeRegExp } from '../../libs/utils';

export const findFirstUser = async (email : string | undefined, username : string | undefined, id : string | undefined) : 
Promise<TUserWithProfileInfo | undefined> => {
    return await db.query.UserTable.findFirst({where : (table, funcs) => funcs.or(id == undefined ? funcs.or(
        username == undefined ? undefined : funcs.eq(table.username, username!), email == undefined ? undefined : 
        funcs.eq(table.email, email!)) : funcs.eq(table.id, id)),
        extras : {username : sql<string>`lower(${UserTable.username})`.as('username')},
        with : {profile : {columns : {userId : false, id : false}}}
    });
}

export const insertUserAuthInfo = async (email : string, username : string, password : string) : Promise<void> => {
    await db.insert(UserTable).values({email, username, password});
}

export const findFirstProfile = async (userId : string) : Promise<TInferSelectUserProfile | undefined> => {
    return await db.query.UserProfileTable.findFirst({
        where : (table, funcs) => funcs.eq(table.userId, userId)
    });
}

export const insertProfileInfo = async (fullName : string, bio : string, profilePic : string, gender : 'male' | 'female', userId : string) :
Promise<TInferSelectUserProfile> => {
    const profileInfo = await db.insert(UserProfileTable).values({fullName, bio, profilePic, gender, userId}).returning();
    return profileInfo[0] as TInferSelectUserProfile;
}

export const updateProfileInfo = async (values : TUpdateProfileInfo) : Promise<TInferSelectUserProfile> => {
    const profileInfo = await db.update(UserProfileTable).set({fullName : values.fullName, bio : values.bio, 
        profilePic : values.profilePic, gender : values.gender
    })
    .where(eq(UserProfileTable.userId, values.userId)).returning();
    return profileInfo[0] as TInferSelectUserProfile;
}

export const searchUserByUsername = async (username : string) : Promise<TUserWithProfileInfo[]> => {
    const escapedQuery = escapeRegExp(username);
    const regexQuery = `%${escapedQuery}%`;

    return await db.query.UserTable.findMany({
        where : (table, funcs) => funcs.ilike(table.username, regexQuery), orderBy : (table, funcs) => funcs.desc(table.username),
        with : {profile : {columns : {id : false, userId : false}}}
    });
}

export const findFirstFollow = async (currentUserId : string, userToFollow : string) : Promise<TInferSelectFollowers | undefined> => {
    return await db.query.FollowersTable.findFirst({
        where : (table, funcs) => funcs.and(funcs.eq(table.followerId, currentUserId), funcs.eq(table.followedId, userToFollow))
    });
}

export const insertFollow = async (currentUserId : string, userToFollow : string) : Promise<void> => {
    await db.insert(FollowersTable).values({followerId : currentUserId, followedId : userToFollow});
}

export const deleteFollow = async (currentUserId : string, userToFollow : string) : Promise<void> => {
    await db.delete(FollowersTable).where(and(eq(FollowersTable.followerId, currentUserId), eq(FollowersTable.followedId, userToFollow)));
}

export const findManyUsers = async (currentUserId : string) : Promise<TInferSelectUser[]> => {
    return await db.query.UserTable.findMany({where : (table, funcs) => funcs.not(funcs.eq(table.id, currentUserId))});
}

export const findLimitedUsers = async () : Promise<TInferSelectUser[]> => {
    return await db.query.UserTable.findMany();
}

export const findManyFollowing = async (currentUserId : string) : Promise<TInferSelectFollowers[]> => {
    return await db.query.FollowersTable.findMany({where : (table, funcs) => funcs.eq(table.followerId, currentUserId)});
}

export const updateAccount = async (values : TInferUpdateUser) : Promise<TInferUpdateUser | undefined> => {
    const { email, username, password, id } = values as TInferUpdateUser;

    if(password) {
        await db.update(UserTable).set({password}).where(eq(UserTable.id, id));
    }else {
        const updatedData = await db.update(UserTable).set({email, username}).where(eq(UserTable.id, id)).returning();
        return updatedData[0] as TInferUpdateUser;
    }
}