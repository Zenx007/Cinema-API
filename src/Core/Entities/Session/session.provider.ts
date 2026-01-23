import { DataSource } from "typeorm";
import { Session } from "./Session.entity";

export const sessionProvider = [
    {
  provide: 'SESSION_REPOSITORY',
  useFactory: (dataSource: DataSource) => dataSource.getRepository(Session),
  inject: ['DATA_SOURCE'],
},
]