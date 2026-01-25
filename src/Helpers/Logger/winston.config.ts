import { utilities as nestWinstonModuleUtilities, WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';

export const winstonConfig: WinstonModuleOptions = {
  levels: winston.config.npm.levels,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.ms(),
        process.env.NODE_ENV === 'production' 
          ? winston.format.json() 
          : nestWinstonModuleUtilities.format.nestLike('CinemaAPI', {
              colors: true,
              prettyPrint: true,
            }),
      ),
    }),
  ],
};