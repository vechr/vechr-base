import { Module } from '@nestjs/common';
import { VechrBaseModule, VechrBaseConfig } from '@vechr/vechr-base';

// Extend the base configuration with custom options
interface MyAppConfig extends VechrBaseConfig {
  database: {
    url: string;
    schema: string;
  };
  features: {
    enableNotifications: boolean;
    maxRetries: number;
  };
}

@Module({
  imports: [
    VechrBaseModule.forRoot({
      config: {
        // Base configuration
        app: {
          port: 3000,
          name: 'my-awesome-app',
        },
        cookie: {
          sameSite: 'strict',
          secure: true,
          httpOnly: true,
        },
        nats: {
          url: process.env.NATS_URL || 'nats://localhost:4222',
          service: 'my-service',
          ca: process.env.NATS_CA || '',
          key: process.env.NATS_KEY || '',
          cert: process.env.NATS_CERT || '',
        },
        jwt: {
          secret: process.env.JWT_SECRET || 'your-secret-key',
          expiresIn: '1d',
          refreshExpiresIn: '7d',
        },
        encryption: {
          secret: process.env.ENCRYPTION_SECRET || 'your-encryption-key',
        },
        logging: {
          loki: {
            host: process.env.LOKI_HOST || 'http://localhost:3100',
            username: process.env.LOKI_USERNAME || '',
            password: process.env.LOKI_PASSWORD || '',
          },
        },
        tracing: {
          otlpHttpUrl: process.env.OTLP_HTTP_URL,
        },
        cache: {
          redis: {
            url: process.env.REDIS_URL,
            ttl: 300,
          },
        },
        // Custom configuration
        database: {
          url: process.env.DATABASE_URL || 'postgresql://user:pass@localhost:5432/mydb',
          schema: 'public',
        },
        features: {
          enableNotifications: true,
          maxRetries: 3,
        },
      },
    }),
  ],
})
export class AppModule {} 