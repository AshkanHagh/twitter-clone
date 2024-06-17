import { sql } from 'drizzle-orm';
import type { TInferSelectUser } from '../../@types';
import { db } from '../db';
import { UserTable } from '../schema';

export const findFirstUser = async (email : string | undefined, username : string | undefined, id : string | undefined) : 
Promise<TInferSelectUser | undefined> => {
    return await db.query.UserTable.findFirst({where : (table, funcs) => funcs.or(id == undefined ? funcs.or(
        username == undefined ? undefined : funcs.eq(table.username, username!), email == undefined ? undefined : 
        funcs.eq(table.email, email!)) : funcs.eq(table.id, id)),
        extras : {lowerCaseUsername : sql<string>`lower(${UserTable.username})`.as('lowerCaseUsername')}
    });
}

export const insertUserAuthInfo = async (email : string, username : string, password : string) : Promise<void> => {
    await db.insert(UserTable).values({email, username, password});
}