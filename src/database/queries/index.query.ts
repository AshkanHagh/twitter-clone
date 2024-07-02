import type { PgTable, TableConfig } from 'drizzle-orm/pg-core';
import { db } from '../db';
import { sql } from 'drizzle-orm';

export const countedRows = async (table : PgTable<TableConfig>): Promise<number> => {
    const result = await db.select({ count: sql`count(*)`.mapWith(Number) }).from(table);
    return result[0].count;
};