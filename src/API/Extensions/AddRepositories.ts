import { Provider } from "@nestjs/common";
import { ISessionRepository } from "../../Core/RepositoriesInterface/ISessionRepository.interface";
import { SessionRepository } from "../../Infrastructure/Repositories/SessionRepository.service";
import { IReservationRepository } from "../../Core/RepositoriesInterface/IReservationRepository.interface";
import { ReservationRepository } from "../../Infrastructure/Repositories/ReservationRepository.service";

const RepositoriesStartup: Provider[] = [];

RepositoriesStartup.push({
    provide: ISessionRepository,
    useClass: SessionRepository
});

RepositoriesStartup.push({
    provide: IReservationRepository,
    useClass: ReservationRepository
});


export default RepositoriesStartup;