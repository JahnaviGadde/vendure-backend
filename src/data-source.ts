import 'dotenv/config';
import { DataSource } from 'typeorm';
import path from 'path';
import { Content } from './plugins/web-content/entities/content.entity'; // Adjust path if necessary

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    schema: process.env.DB_SCHEMA,
    synchronize: false,
    logging: false,
    entities: [Content],
    migrations: [path.join(__dirname, './migrations/*.{ts,js}')],
});
