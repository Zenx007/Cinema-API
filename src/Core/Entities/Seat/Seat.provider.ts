import { DataSource } from "typeorm";
import { Seat } from "./Seat.entity";

export const seatProvider = [
    {
  provide: 'SEAT_REPOSITORY',
  useFactory: (dataSource: DataSource) => dataSource.getRepository(Seat),
  inject: ['DATA_SOURCE'],
},
]