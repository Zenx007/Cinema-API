import { Provider } from "@nestjs/common";
import { ISessionService } from "../../Core/ServicesInterface/ISessionService.interface";
import { SessionService } from "../../Infrastructure/Services/SessionService.service";

const ServicesStartup: Provider[] = [];

export const AllServicesInjects = ServicesStartup.map(
    (provider) => provider['useClass'],
);

ServicesStartup.push({
    provide: ISessionService,
    useClass: SessionService,
});


export default ServicesStartup;