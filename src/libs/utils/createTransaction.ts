import { db } from '../../database/db';

export const createTransaction = async <T extends typeof db>(callback : (trx : T) => void) => {
    await db.transaction(callback as any);
}