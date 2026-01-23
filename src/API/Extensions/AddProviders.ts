import { Inject } from "@nestjs/common";
import { Reservation } from "src/Core/Entities/Reservation/Reservation.entity";
import { reservationProvider } from "src/Core/Entities/Reservation/Reservation.provider";
import { seatProvider } from "src/Core/Entities/Seat/Seat.provider";
import { sessionProvider } from "src/Core/Entities/Session/session.provider";
import { DataSource, Repository } from "typeorm";

type Provider = {
    provide: string;
    useFactory: (datasource: DataSource) => Repository<any>;
    inject: string[];
};

const AddProviders: Provider[] = [];

AddProviders.push(...reservationProvider);
AddProviders.push(...sessionProvider);
AddProviders.push(...seatProvider);

export default AddProviders;