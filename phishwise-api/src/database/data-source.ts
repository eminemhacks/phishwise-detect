import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config as loadEnv } from 'dotenv';
import { User } from '../users/user.entity';
import { Progress } from '../progress/progress.entity';
import { AuthToken } from '../auth/auth-token.entity';
import { Category, Lesson, Quiz } from '../lessons/content.entities';
import { QuizAttempt } from '../quizzes/quiz-attempt.entity';
import { Scan } from '../detection/scan.entity';

loadEnv();

const useUrl = !!process.env.DATABASE_URL;
const useSsl =
  process.env.DB_SSL === 'true' ||
  (process.env.DB_SSL !== 'false' && useUrl);

export const AppDataSource = new DataSource({
  type: 'postgres',
  ...(useUrl
    ? { url: process.env.DATABASE_URL }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT ?? '', 10) || 5432,
        username: process.env.DB_USERNAME || 'phishwise',
        password: process.env.DB_PASSWORD || 'phishwise',
        database: process.env.DB_NAME || 'phishwise',
      }),
  ssl: useSsl ? { rejectUnauthorized: false } : false,
  entities: [User, Progress, AuthToken, Category, Lesson, Quiz, QuizAttempt, Scan],
  // In a compiled build the migrations are .js under dist; in ts-node they are .ts.
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: ['error', 'warn'],
});
