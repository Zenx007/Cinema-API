import { DataSource } from "typeorm";
import { Reservation } from "./Reservation.entity";

export const reservationProvider = [
    {
  provide: 'RESERVATION_REPOSITORY',
  useFactory: (dataSource: DataSource) => dataSource.getRepository(Reservation),
  inject: ['DATA_SOURCE'],
},
]