import { Provider } from "@nestjs/common";
import { ISessionService } from "../../Core/ServicesInterface/ISessionService.interface";
import { SessionService } from "../../Infrastructure/Services/SessionService.service";
import { IReservationService } from "../../Core/ServicesInterface/IReservationService.interface";
import { ReservationService } from "../../Infrastructure/Services/ReservationService.service";

const ServicesStartup: Provider[] = [];

export const AllServicesInjects = ServicesStartup.map(
    (provider) => provider['useClass'],
);

ServicesStartup.push({
    provide: ISessionService,
    useClass: SessionService,
});

ServicesStartup.push({
    provide: IReservationService,
    useClass: ReservationService,
});


export default ServicesStartup;