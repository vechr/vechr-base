/* This TypeScript code defines an interface named `BaseConfig` which represents the configuration
structure for a web application. Here's a breakdown of what each property within the `BaseConfig`
interface represents: */
export interface BaseConfig {
  app: {
    port: number;
    name: string;
  };
  cookie: {
    sameSite: 'lax' | 'strict' | 'none';
    secure: boolean;
    httpOnly: boolean;
  };
  nats: {
    url: string;
    service: string;
    ca: string;
    key: string;
    cert: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
    refreshExpiresIn: string;
  };
  encryption: {
    secret: string;
  };
  audit: {
    events: {
      created: string;
      updated: string;
      deleted: string;
      upsert: string;
    };
  };
  logging: {
    loki: {
      host: string;
      username: string;
      password: string;
    };
  };
  tracing: {
    otlpHttpUrl?: string;
  };
  cache: {
    redis?: {
      url?: string;
      ttl: number;
    };
  };
}
