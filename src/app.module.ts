import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AddControllers } from './API/Extensions/AddController';
import { AddProfiles } from './API/Extensions/AddProfiles';
import AddProviders from './API/Extensions/AddProviders';
import RepositoriesStartup from './API/Extensions/AddRepositories';
import ServicesStartup, { AllServicesInjects } from './API/Extensions/AddService';
import { DatabaseModule } from './Infrastructure/Database/database.module';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './Helpers/Logger/winston.config';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [DatabaseModule, WinstonModule.forRoot(winstonConfig), ScheduleModule.forRoot()],
  controllers: [...AddControllers],
  providers: [
    AppService,
    ...AllServicesInjects,
    ...AddProviders,
    ...AddProfiles,
    ...RepositoriesStartup,
    ...ServicesStartup
  ],
  exports: [
    ...AddProfiles,
    ...ServicesStartup,
    ...AddProviders,
    ...RepositoriesStartup
  ]
})
export class AppModule {}
