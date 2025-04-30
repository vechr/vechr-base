import { WinstonModuleOptions, utilities } from 'nest-winston';
import { transports } from 'winston';
import * as winston from 'winston';
import * as expressWinston from 'express-winston';
import LokiTransport from 'winston-loki';
import appConfig from '@/config/app.config';

const { combine, timestamp, ms } = winston.format;

/**
 * Level of logs!
 * error: 0,
 * warn: 1,
 * info: 2,
 * http: 3,
 * verbose: 4,
 * debug: 5,
 * silly: 6
 **/

const winstonFormat = combine(
  timestamp(),
  ms(),
  utilities.format.nestLike(appConfig.app.name, {
    colors: true,
    prettyPrint: true,
  }),
);

const consoleTransport = new transports.Console({
  format: winstonFormat,
});

const lokiTransport = new LokiTransport({
  labels: { application: appConfig.app.name },
  batching: false,
  host: appConfig.logging.loki.host,
  basicAuth:
    appConfig.logging.loki.username && appConfig.logging.loki.password
      ? `${appConfig.logging.loki.username}:${appConfig.logging.loki.password}`
      : undefined,
  format: winstonFormat,
});

export const winstonModuleOptions: WinstonModuleOptions = {
  levels: winston.config.npm.levels,
  transports: [
    consoleTransport,
    // Add Loki Logging
    lokiTransport,
  ],
};

export const log = winston.createLogger(winstonModuleOptions);

export const winstonExpressOptions: expressWinston.LoggerOptions = {
  transports: [
    consoleTransport,
    // Add Loki Logging
    lokiTransport,
  ],
  statusLevels: false,
  format: winstonFormat,
  level: function (_, res, err) {
    if (res.statusCode >= 400 && res.statusCode < 500) {
      return 'warn';
    } else if (res.statusCode >= 500 || err) {
      return 'error';
      // } else if (res.statusCode >= 300 && res.statusCode < 400) {
      // return 'info';
    } else if (res.statusCode >= 200 && res.statusCode < 300) {
      return 'info';
    }
    return 'debug';
  },
};
