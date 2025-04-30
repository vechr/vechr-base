# Vechr Base Example Application

This is an example application demonstrating how to use the Vechr Base package in a NestJS application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file:
```env
# App Configuration
APP_PORT=3000
APP_NAME=my-awesome-app

# NATS Configuration
NATS_URL=nats://localhost:4222
NATS_CA=path/to/ca.pem
NATS_KEY=path/to/key.pem
NATS_CERT=path/to/cert.pem

# JWT Configuration
JWT_SECRET=your-secret-key
ENCRYPTION_SECRET=your-encryption-key

# Database Configuration
DATABASE_URL=postgresql://user:pass@localhost:5432/mydb

# Logging Configuration
LOKI_HOST=http://localhost:3100
LOKI_USERNAME=
LOKI_PASSWORD=

# Tracing Configuration
OTLP_HTTP_URL=http://localhost:4318

# Cache Configuration
REDIS_URL=redis://localhost:6379
```

3. Start the application:
```bash
npm run start:dev
```

## Available Endpoints

The example application provides the following endpoints to demonstrate configuration usage:

- `GET /info` - Get application information and feature flags
- `GET /config/database` - Get database configuration
- `GET /config/cache` - Get cache configuration
- `GET /config/logging` - Get logging configuration

## Configuration Structure

The example demonstrates how to:

1. Extend the base configuration:
```typescript
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
```

2. Use the configuration in services:
```typescript
@Injectable()
export class AppService {
  private readonly config = VechrBaseModuleConfig.getConfig();

  getAppInfo() {
    return {
      name: this.config.app?.name,
      port: this.config.app?.port,
      features: {
        notifications: (this.config as any).features?.enableNotifications,
        maxRetries: (this.config as any).features?.maxRetries,
      },
    };
  }
}
```

## Features Demonstrated

- Configuration extension
- Environment variable handling
- Type safety
- Module configuration
- Service configuration access
- API endpoints for configuration inspection