import { Redis } from 'ioredis';

const { REDIS_URL } = process.env;
export const redis = new Redis(REDIS_URL);