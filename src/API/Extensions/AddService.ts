import { Provider } from "@nestjs/common";
import { ISessionService } from "../../Core/ServicesInterface/ISessionService.interface";
import { SessionService } from "../../Infrastructure/Services/SessionService.service";
import { IReservationService } from "../../Core/ServicesInterface/IReservationService.interface";
import { ReservationService } from "../../Infrastructure/Services/ReservationService.service";
import { ISeatService } from "../../Core/ServicesInterface/ISeatService.interface";
import { SeatService } from "../../Infrastructure/Services/SeatService.service";
import { IReservationCleanupService } from "../../Core/ServicesInterface/IReservationCleanupService.interface";
import { ReservationCleanupService } from "../../Infrastructure/Services/ReservationCleanup.service";

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

ServicesStartup.push({
    provide: ISeatService,
    useClass: SeatService,
});

ServicesStartup.push({
    provide: IReservationCleanupService,
    useClass: ReservationCleanupService,
});


export default ServicesStartup;