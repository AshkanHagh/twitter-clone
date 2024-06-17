import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const migrationClient = postgres(process.env.DATABASE_URL, {max : 1});
const migration = async () => {
    await migrate(drizzle(migrationClient), {migrationsFolder : './src/database/migrations'});
    await migrationClient.end();
}
migration();