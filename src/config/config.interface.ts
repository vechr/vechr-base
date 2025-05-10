export interface AppConfig {
  port: number;
  name: string;
}

export interface CookieConfig {
  sameSite: 'lax' | 'strict' | 'none';
  secure: boolean;
  httpOnly: boolean;
}

export interface NatsConfig {
  url: string;
  service: string;
  ca: string;
  key: string;
  cert: string;
}

export interface JwtConfig {
  secret: string;
  expiresIn: string;
  refreshExpiresIn: string;
}

export interface EncryptionConfig {
  secret: string;
}

export interface AuditEventsConfig {
  created: string;
  updated: string;
  deleted: string;
  upsert: string;
}

export interface AuditConfig {
  events: AuditEventsConfig;
}

export interface LokiConfig {
  host: string;
  username: string;
  password: string;
}

export interface LoggingConfig {
  loki: LokiConfig;
}

export interface TracingConfig {
  otlpHttpUrl?: string;
}

export interface RedisConfig {
  url?: string;
  ttl: number;
}

export interface CacheConfig {
  redis?: RedisConfig;
}

export interface SubjectConfig {
  level1_company: string;
  level2_facility: string;
  level3_productionLine: string;
  level4_environment: string;
  level5_serviceCategory: string;
  level6_serviceName: string;
  level9_instanceId: string;
}

/* This TypeScript code defines an interface named `BaseConfig` which represents the configuration
structure for a web application. Here's a breakdown of what each property within the `BaseConfig`
interface represents: */
export interface BaseConfig {
  app: AppConfig;
  cookie: CookieConfig;
  nats: NatsConfig;
  jwt: JwtConfig;
  encryption: EncryptionConfig;
  audit: AuditConfig;
  logging: LoggingConfig;
  tracing: TracingConfig;
  cache: CacheConfig;
  subject: SubjectConfig;
}
