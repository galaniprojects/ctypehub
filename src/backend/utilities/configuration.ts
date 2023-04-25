import { cwd } from 'node:process';
import path from 'node:path';

import dotenv from 'dotenv';

dotenv.config();
const { env } = process;

const httpAuthPassword = env.SECRET_HTTP_AUTH_PASSWORD;

export const configuration = {
  port: env.PORT || 3000,
  host: env.HOST || '127.0.0.1',
  isProduction: env.NODE_ENV === 'production',
  distFolder: path.join(cwd(), 'dist', 'frontend'),
  httpAuthPassword,
  databaseUri:
    env.DATABASE_URI || 'postgres://postgres:postgres@localhost:5432/postgres',
};
