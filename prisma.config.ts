import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
    // Tells Prisma where to find your schema file
    schema: 'prisma/schema.prisma',

    // Directly provides the database URL to the CLI
    datasource: {
        url: env('DATABASE_URL'),
    },
});