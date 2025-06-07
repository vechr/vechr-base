import { WinstonModuleOptions, utilities } from 'nest-winston';
import { transports } from 'winston';
import * as winston from 'winston';
import * as expressWinston from 'express-winston';
import LokiTransport from 'winston-loki';
import baseConfig from '@/config/base.config';

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
  utilities.format.nestLike(baseConfig.app.name, {
    colors: true,
    prettyPrint: true,
  }),
);

const consoleTransport = new transports.Console({
  format: winstonFormat,
});

const lokiTransport = new LokiTransport({
  labels: { application: baseConfig.app.name },
  batching: false,
  host: baseConfig.logging.loki.host,
  basicAuth:
    baseConfig.logging.loki.username && baseConfig.logging.loki.password
      ? `${baseConfig.logging.loki.username}:${baseConfig.logging.loki.password}`
      : undefined,
  format: winstonFormat,
});

// Create transports array conditionally
const createTransports = (): winston.transport[] => {
  const transportsArray: winston.transport[] = [consoleTransport];

  // Add Loki Logging only if host is configured
  if (baseConfig.logging.loki.host !== '') {
    transportsArray.push(lokiTransport);
  }

  return transportsArray;
};

export const winstonModuleOptions: WinstonModuleOptions = {
  levels: winston.config.npm.levels,
  transports: createTransports(),
};

export const log = winston.createLogger(winstonModuleOptions);

export const winstonExpressOptions: expressWinston.LoggerOptions = {
  transports: createTransports(),
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
