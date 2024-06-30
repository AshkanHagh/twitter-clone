import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { faker } from '@faker-js/faker';
import { UserTable } from './schema';
import bcrypt from 'bcrypt';
import { insertPost } from './queries/post.query';
import { postEventEmitter } from '../events/post.event';
import { addToListWithScore } from './cache/index.cache';

const pool = postgres(process.env.DATABASE_URL as string);
const db = drizzle(pool);

const main = async () => {
    console.log('seeding started');

    for(let index = 0; index <= 50; index++) {
        // const salt = await bcrypt.genSalt(10);
        // const hashedPassword = await bcrypt.hash('ashkan1386129', salt);

        // const randomName = faker.person.fullName().toLowerCase();

        // const user = await db.insert(UserTable).values({
        //     email : faker.internet.email({firstName : randomName, lastName : `${index}`}), 
        //     username : faker.internet.userName({firstName : randomName, lastName : `${index}`}), password : hashedPassword
        // }).returning()
        // const userResult = user[0];
        const post = await insertPost('eec5c119-899e-4400-b609-07abbd4881e6', faker.lorem.text(), faker.image.avatar());
        addToListWithScore(`suggest_post:${'eec5c119-899e-4400-b609-07abbd4881e6'}`, 2, post.id);
        postEventEmitter.emit('create-post');
    }

    console.log('end');
    process.exit(0);
}

main().catch((error : any) => {
    console.error(error.message);
    process.exit(0);
});