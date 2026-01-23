import { Db_DataSource } from "./dataSource";
import { config as dotenvConfig } from 'dotenv';

dotenvConfig({path:".env"})

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      const dataSource = Db_DataSource;
      console.log('Iniciando o DataSource...');
      await dataSource.initialize();
      console.log('Iniciado com sucesso!');
      return dataSource; 
    },
  },
];

