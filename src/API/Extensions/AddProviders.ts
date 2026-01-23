import { Inject } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { reservationProvider } from "../../Core/Entities/Reservation/Reservation.provider";
import { seatProvider } from "../../Core/Entities/Seat/Seat.provider";
import { sessionProvider } from "../../Core/Entities/Session/session.provider";

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