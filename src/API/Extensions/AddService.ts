import { Provider } from "@nestjs/common";

const ServicesStartup: Provider[] = [];

export const AllServicesInjects = ServicesStartup.map(
    (provider) => provider['useClass'],
);

export default ServicesStartup;