import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { faker } from '@faker-js/faker';
import { insertPost } from './queries/post.query';
import { zincrbyPostSuggest } from './cache/post.cache';
import { UserTable } from './schema';
import bcrypt from 'bcrypt';

const pool = postgres(process.env.DATABASE_URL as string);
const db = drizzle(pool);

const main = async () => {
    console.log('seeding started');
    const salt = await bcrypt.genSalt(10);

    for(let index = 0; index <= 50; index++) {
        const hashedPassword = await bcrypt.hash('ashkan1386129', salt);

        const randomName = faker.person.fullName().toLowerCase();

        const user = await db.insert(UserTable).values({
            email : faker.internet.email({firstName : randomName, lastName : `${index}`}), 
            username : faker.internet.userName({firstName : randomName, lastName : `${index}`}), password : hashedPassword
        }).returning()
        const userResult = user[0];

        // const post = await insertPost(userResult.id, faker.lorem.text(), faker.image.url())
        // await zincrbyPostSuggest('post:suggest', 50, post.id);
    }

    console.log('end');
    process.exit(0);
}

main().catch((error : any) => {
    console.error(error.message);
    process.exit(0);
});