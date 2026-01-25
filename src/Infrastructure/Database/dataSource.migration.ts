import 'dotenv/config';
import { DataSource } from 'typeorm';
import { EntitiesConfigurations } from './entities';

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is not defined`);
  }
  return value;
}

export const MigrationDataSource = new DataSource({
  type: 'postgres',
  host: getEnv('DB_HOST'),
  port: Number(getEnv('DB_PORT')),
  username: getEnv('DB_USER'),
  password: getEnv('DB_PASSWORD'),
  database: getEnv('DB_NAME'),
  entities: [...EntitiesConfigurations],
  migrations: ['src/Infrastructure/Migrations/*.ts'],
  synchronize: true,
  migrationsTableName: '__nest_migrations',
});