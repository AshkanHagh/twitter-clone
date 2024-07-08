import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { faker } from '@faker-js/faker';
import { UserTable } from './schema';
import bcrypt from 'bcrypt';
import { insertPost } from './queries/post.query';
import { postEventEmitter } from '../events/post.event';
import type { TErrorHandler } from '../types/types';

const pool = postgres(process.env.DATABASE_URL as string);
const db = drizzle(pool);

const main = async () => {
    console.log('seeding started');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('ashkan1386129', salt);

    for(let index = 1; index < 150; index++) {
        const randomName = faker.person.fullName().toLowerCase();
        const [user] = await db.insert(UserTable).values({
            email : faker.internet.email({firstName : randomName, lastName : `${index}`}), 
            username : faker.internet.userName({firstName : randomName, lastName : `${index}`}), password : hashedPassword
        }).returning();

        for (let b = 0; b <= 5; b++) {
            console.log(`post :${b}`)
            const post = await insertPost(user.id, faker.lorem.text(), faker.image.avatar());
            postEventEmitter.emit('create-post', user.id, post.id);
            postEventEmitter.emit('post_cache', post.id);

            for (let k = 0; k < 1; k++) {
                console.log(`like :${k}`)
                const randomName = faker.person.fullName().toLowerCase();
                const [user] = await db.insert(UserTable).values({
                    email : faker.internet.email({firstName : randomName, lastName : `${k}`}), 
                    username : faker.internet.userName({firstName : randomName, lastName : `${k}`}), password : hashedPassword
                }).returning();

                postEventEmitter.emit('like-post', user.id, post.userId, post.id);
            }
            
        }
    
        //     for (let k = 0; k < 1; k++) {
        //         const totalUsers = await countRow(UserTable);

        //         const score = await getListScore(`suggest_post:${user.id}`);
        //         const scoreObj = {};
        //         for (let i = 0; i < score.length; i += 2) {
        //             const postId = score[i];
        //             const postScore = score[i + 1];
        //             scoreObj[postId] = +postScore;
        //         }   
    
        //         const listLength = score.length / 2;

        //         const randomName = faker.person.fullName().toLowerCase();
        //         const user1 = await db.insert(UserTable).values({
        //             email : faker.internet.email({firstName : randomName, lastName : `${index}`}), 
        //             username : faker.internet.userName({firstName : randomName, lastName : `${index}`}), password : hashedPassword
        //         }).returning();

        //         for (let c = 0; c < 10; c++) {
        //             const newComment = await insertComment(user1[0].id, post.id, faker.lorem.words());
        //             const score = await getListScore(`suggest_post:${user.id}`);
        //             const scoreObj = {};
        //             for (let i = 0; i < score.length; i += 2) {
        //                 const postId = score[i];
        //                 const postScore = score[i + 1];
        //                 scoreObj[postId] = +postScore;
        //             }   
        
        //             const listLength = score.length / 2;
                    
        //             if(listLength < totalUsers) {
        //                 await Promise.all([
        //                     addHashListCache(`post_comments:${post.id}`, newComment.id, newComment, 2419200),
        //                     addToListWithScore(`suggest_post:${post.userId}`, Math.ceil(totalUsers == 0 ? 1 : totalUsers * 0.01), post.id),
        //                 ]);
        //                 postEventEmitter.emit('create-post', post.id);
        //             }
        //         }
        //         postEventEmitter.emit('like-post', user1[0].id, post.userId, post.id, Math.ceil(totalUsers == 0 ? 1 : totalUsers * 0.01), listLength);
        //     }
        // }
    }

    console.log('end');
    process.exit(0);
}

main().catch((err) => {
    const error = err as TErrorHandler;
    console.error(error.message);
    process.exit(0);
});