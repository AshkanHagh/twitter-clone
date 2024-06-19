import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import { FollowersTable, UserProfileTable, UserTable } from './schema';
import { redis } from './redis';
import { insertHashListCache } from './cache/global.cache';

const pool = postgres(process.env.DATABASE_URL as string);
const db = drizzle(pool);

const main = async () => {
    console.log('seeding started');
    const salt = await bcrypt.genSalt(10);

    for(let index = 0; index <= 750; index++) {
        const hashedPassword = await bcrypt.hash(faker.string.uuid(), salt);

        const randomName = faker.person.fullName();

        const user = await db.insert(UserTable).values({
            email : faker.internet.email({firstName : randomName, lastName : `${index}`}), 
            username : faker.internet.userName({firstName : randomName, lastName : `${index}`}), password : hashedPassword
        }).returning()
        const userResult = user[0];

        await Promise.all([await db.insert(FollowersTable).values({followerId : userResult.id, followedId : '388f4859-6761-48f8-8142-1612a326c310'}),
            await db.insert(FollowersTable).values({followerId : '388f4859-6761-48f8-8142-1612a326c310', followedId : userResult.id}),
            await db.insert(UserProfileTable).values({
                userId : userResult.id, fullName : randomName+index,
                bio : faker.person.bio(), gender : faker.person.sexType(), profilePic : faker.image.avatar()
            }),
            redis.hset(`user:${userResult.id}`, userResult),
            insertHashListCache(`followings:${'388f4859-6761-48f8-8142-1612a326c310'}`, userResult.id, userResult, 604800),
            insertHashListCache(`followers:${'388f4859-6761-48f8-8142-1612a326c310'}`, userResult.id, userResult, 604800)
        ])
    }

    console.log('end');
    process.exit(0);
}

main().catch((error : any) => {
    console.error(error.message);
    process.exit(0);
});