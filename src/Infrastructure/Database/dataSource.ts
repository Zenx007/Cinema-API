import { DataSource } from "typeorm";
import { EntitiesConfigurations } from "./entities";
import { CONFIGURATION } from "../../app.configuration";


export const Db_DataSource = new DataSource({
    type: 'postgres',
    host: CONFIGURATION.HOST ,
    port: CONFIGURATION.PORT,
    username: CONFIGURATION.USERNAME,
    password: CONFIGURATION.PASSWORD,
    database: CONFIGURATION.DATABASE,
    entities: [
        ...EntitiesConfigurations
    ],
    migrations: ['src/Infrastructure/Migrations/*{.ts,.js}'],
    synchronize: false,
    migrationsTableName: '__nest_migrations',
});