/* This TypeScript code snippet is defining a configuration object `config` that contains various
settings for different parts of an application. It uses environment variables to populate these
settings, with default values provided where necessary. The `env-var` library is used to access
environment variables, and the `dotenv` library is used to load variables from a `.env` file. */
import * as env from 'env-var';
import dotenv = require('dotenv');
import { BaseConfig } from './config.interface';
dotenv.config();

const config: BaseConfig = {
  app: {
    // Optional
    port: env.get('APP_PORT').default(3000).asInt(),
    name: env.get('APP_NAME').default('vechr-service').asString(),
  },
  cookie: {
    // Optional
    sameSite: env.get('COOKIE_SAME_SITE').default('strict').asString() as
      | 'lax'
      | 'strict'
      | 'none',
    secure: env.get('COOKIE_SECURE').default('true').asBoolStrict(),
    httpOnly: env.get('COOKIE_HTTP_ONLY').default('true').asBoolStrict(),
  },
  nats: {
    // Optional
    url: env.get('NATS_URL').default('nats://localhost:4222').asString(),
    service: 'NATS_SERVICE',
    ca: env.get('NATS_CA').default('').asString(),
    key: env.get('NATS_KEY').default('').asString(),
    cert: env.get('NATS_CERT').default('').asString(),
  },
  jwt: {
    // Optional
    secret: env.get('JWT_SECRET').default('secretvechr').asString(),
    expiresIn: env.get('JWT_EXPIRES_IN').default('3d').asString(),
    refreshExpiresIn: env
      .get('JWT_REFRESH_EXPIRES_IN')
      .default('30d')
      .asString(),
  },
  encryption: {
    // Optional
    secret: env.get('ECRYPTED_SECRET').default('usersecret').asString(),
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
    // Optional
    loki: {
      host: env.get('LOKI_HOST').default('').asString(),
      username: env.get('LOKI_USERNAME').default('').asString(),
      password: env.get('LOKI_PASSWORD').default('').asString(),
    },
  },
  tracing: {
    // Optional
    otlpHttpUrl: env.get('OTLP_HTTP_URL').asString(),
  },
  cache: {
    // Optional
    redis: {
      url: env.get('REDIS_URL').asString(),
      ttl: env.get('REDIS_TTL').default(300).asInt(),
    },
  },
  subject: {
    // Optional
    level1_company: env.get('LEVEL1_COMPANY').default('vechr').asString(),
    level2_facility: env.get('LEVEL2_FACILITY').default('idn').asString(),
    level3_productionLine: env
      .get('LEVEL3_PRODUCTION_LINE')
      .default('line_1')
      .asString(),
    level4_environment: env
      .get('LEVEL4_ENVIRONMENT')
      .default('production')
      .asString(),
    level5_serviceCategory: env
      .get('LEVEL5_SERVICE_CATEGORY')
      .default('service')
      .asString(),
    level6_serviceName: env
      .get('LEVEL6_SERVICE_NAME')
      .default('vechr_service')
      .asString(),
    level9_instanceId: env.get('LEVEL9_INSTANCE_ID').default('s1').asString(),
  },
};

export const loadBaseConfig = (): BaseConfig => {
  return config;
};

export default Object.freeze(config);
