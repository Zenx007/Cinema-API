import { Provider } from "@nestjs/common";
import { ISessionRepository } from "../../Core/RepositoriesInterface/ISessionRepository.interface";
import { SessionRepository } from "../../Infrastructure/Repositories/SessionRepository.service";
import { IReservationRepository } from "../../Core/RepositoriesInterface/IReservationRepository.interface";
import { ReservationRepository } from "../../Infrastructure/Repositories/ReservationRepository.service";
import { ISeatRepository } from "../../Core/RepositoriesInterface/ISeatRepository.interface";
import { SeatRepository } from "../../Infrastructure/Repositories/SeatRepository.service";

const RepositoriesStartup: Provider[] = [];

RepositoriesStartup.push({
    provide: ISessionRepository,
    useClass: SessionRepository
});

RepositoriesStartup.push({
    provide: IReservationRepository,
    useClass: ReservationRepository
});

RepositoriesStartup.push({
    provide: ISeatRepository,
    useClass: SeatRepository
});



export default RepositoriesStartup;