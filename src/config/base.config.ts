import * as env from 'env-var';
import dotenv = require('dotenv');
import { BaseConfig } from './config.interface';
dotenv.config();

const config: BaseConfig = {
  app: {
    port: env.get('APP_PORT').default(3000).asInt(),
    name: env.get('APP_NAME').default('things-service').asString(),
  },
  cookie: {
    sameSite: env.get('COOKIE_SAME_SITE').default('strict').asString() as
      | 'lax'
      | 'strict'
      | 'none',
    secure: env.get('COOKIE_SECURE').default('true').asBoolStrict(),
    httpOnly: env.get('COOKIE_HTTP_ONLY').default('true').asBoolStrict(),
  },
  nats: {
    url: env.get('NATS_URL').required().asString(),
    service: 'NATS_SERVICE',
    ca: env.get('NATS_CA').required().asString(),
    key: env.get('NATS_KEY').required().asString(),
    cert: env.get('NATS_CERT').required().asString(),
  },
  jwt: {
    secret: env.get('JWT_SECRET').required().asString(),
    expiresIn: env.get('JWT_EXPIRES_IN').default('3d').asString(),
    refreshExpiresIn: env
      .get('JWT_REFRESH_EXPIRES_IN')
      .default('30d')
      .asString(),
  },
  encryption: {
    secret: env.get('ECRYPTED_SECRET').required().asString(),
  },
  audit: {
    events: {
      created: 'audit.created',
      updated: 'audit.updated',
      deleted: 'audit.deleted',
      upsert: 'audit.upsert',
    },
  },
  logging: {
    loki: {
      host: env.get('LOKI_HOST').required().asString(),
      username: env.get('LOKI_USERNAME').default('').asString(),
      password: env.get('LOKI_PASSWORD').default('').asString(),
    },
  },
  tracing: {
    otlpHttpUrl: env.get('OTLP_HTTP_URL').asString(),
  },
  cache: {
    redis: {
      url: env.get('REDIS_URL').asString(),
      ttl: env.get('REDIS_TTL').default(300).asInt(),
    },
  },
};

export const loadBaseConfig = (): BaseConfig => {
  return config;
};

export default Object.freeze(config);
