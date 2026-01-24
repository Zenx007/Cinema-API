import { DataSource } from 'typeorm';
import { EntitiesConfigurations } from './entities';
import { CONFIGURATION } from '../../../app.configuration';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig({ path: '.env' });

export const databaseProviders = [
  {
    provide: DataSource, 
    useFactory: async () => {
      console.log('Iniciando o DataSource...');

      const dataSource = new DataSource({
        type: 'postgres',
        host: CONFIGURATION.HOST,
        port: CONFIGURATION.PORT,
        username: CONFIGURATION.USERNAME,
        password: CONFIGURATION.PASSWORD,
        database: CONFIGURATION.DATABASE,
        entities: EntitiesConfigurations,
        migrations: ['dist/Infrastructure/Migrations/*{.js}'],
        synchronize: false,
      });

      await dataSource.initialize();

      console.log('Iniciado com sucesso!');
      return dataSource;
    },
  },
];
