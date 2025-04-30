# Vechr Base

A NestJS-based foundation package for building scalable applications. This package provides a set of common utilities, configurations, and best practices for NestJS applications.

## Installation

```bash
# Using npm
npm install @vechr/vechr-base

# Using yarn
yarn add @vechr/vechr-base

# Using pnpm
pnpm add @vechr/vechr-base
```

## Configuration

1. First, create a `.npmrc` file in your project root with the following content:

```ini
@vechr:registry=https://npm.pkg.github.com
```

2. Authenticate with GitHub Packages:

```bash
npm login --registry=https://npm.pkg.github.com
```

## Usage

### Basic Usage

```typescript
import { Module } from '@nestjs/common';
import { VechrBaseModule } from '@vechr/vechr-base';

@Module({
  imports: [
    VechrBaseModule.forRoot({
      // Your configuration options here
    }),
  ],
})
export class AppModule {}
```

### Extending Configuration

You can extend the base configuration by implementing the `VechrBaseConfig` interface:

```typescript
import { Module } from '@nestjs/common';
import { VechrBaseModule, VechrBaseConfig } from '@vechr/vechr-base';

// Extend the base configuration
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
        app: {
          port: 3000,
          name: 'my-awesome-app',
        },
        // ... other base config
        database: {
          url: process.env.DATABASE_URL,
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
```

## Features

- Built-in tracing and monitoring
- Database integration with Prisma
- Caching support
- Authentication and authorization
- API documentation with Swagger
- Health checks
- Logging with Winston
- And more...

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.