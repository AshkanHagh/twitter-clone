import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import { UserTable } from './schema';
import { redis } from './redis';

const pool = postgres(process.env.DATABASE_URL as string);
const db = drizzle(pool);

const main = async () => {
    console.log('seeding started');
    const salt = await bcrypt.genSalt(10);

    for(let index = 0; index <= 35; index++) {
        const hashedPassword = await bcrypt.hash(faker.string.uuid(), salt);

        const randomName = faker.person.fullName();

        const user = await db.insert(UserTable).values({
            email : faker.internet.email({firstName : randomName, lastName : `${index}`}), 
            username : faker.internet.userName({firstName : randomName, lastName : `${index}`}), password : hashedPassword
        }).returning()

        await redis.hset(`user:${user[0].id}`, user[0]);
    }

    console.log('end');
    process.exit(0);
}

main().catch((error : any) => {
    console.error(error.message);
    process.exit(0);
});