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
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { RabbitMQModule } from './Infrastructure/Messaging/RabbitMQ.module';


@Module({
  imports: [DatabaseModule,
    WinstonModule.forRoot(winstonConfig),
    ScheduleModule.forRoot(),
    CacheModule.register({
      isGlobal: true,        
      store: redisStore,   
      host: 'cinema_redis',  
      port: 6379,
      ttl: 5,               
    }),
  RabbitMQModule,
],
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
export class AppModule { }
