import { Provider } from "@nestjs/common";
import { ISessionRepository } from "../../Core/RepositoriesInterface/ISessionRepository.interface";
import { SessionRepository } from "../../Infrastructure/Repositories/SessionRepository.service";

const RepositoriesStartup: Provider[] = [];

RepositoriesStartup.push({
    provide: ISessionRepository,
    useClass: SessionRepository
});


export default RepositoriesStartup;