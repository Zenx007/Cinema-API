export const CONFIGURATION = {
  HOST: process.env.DB_HOST || 'localhost', 
  PORT: Number(process.env.DB_PORT) || 5432,
  USERNAME: process.env.DB_USER || 'postgres',
  PASSWORD: process.env.DB_PASSWORD || 'root',
  DATABASE: process.env.DB_NAME || 'cinema_db',
};