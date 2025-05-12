# Vechr Base

A NestJS-based foundation package for building scalable applications. This package provides a set of common utilities, configurations, and best practices for NestJS applications.

## Table of Contents
- [Installation](#installation)
- [Configuration](#configuration)
- [Features](#features)
- [Framework Implementation](#framework-implementation)
- [Messaging with NATS](#messaging-with-nats)
- [Contributing](#contributing)
- [License](#license)

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

## Features

- Built-in tracing and monitoring
- Database integration with Prisma
- Caching support
- Authentication and authorization
- API documentation with Swagger
- Health checks
- Logging with Winston
- And more...

## Framework Implementation

The package includes a comprehensive shared framework implementation that provides common utilities and patterns for building NestJS applications. Here's an overview of the available components:

### Shared Framework Structure

```
src/frameworks/shared/
├── controllers/     # Base controllers and RPC implementations
├── decorators/      # Custom decorators for metadata and configuration
├── exceptions/      # Custom exception handlers
├── filters/         # Exception filters
├── guards/          # Authentication and authorization guards
├── interceptors/    # Request/response interceptors
├── middlewares/     # Custom middleware implementations
├── pipes/           # Data transformation and validation pipes
├── responses/       # Standardized response formats
└── utils/           # Utility functions and helpers
```

### Key Components

#### Controllers
- Base controllers with common CRUD operations
- RPC-extended controllers for microservice communication

#### Decorators
- Custom decorators for metadata handling
- Configuration decorators
- Authentication decorators

#### Guards
- Authentication guards
- Role-based access control
- Permission guards

#### Interceptors
- Request/response transformation
- Logging interceptors
- Error handling interceptors

#### Middlewares
- Request validation
- Authentication middleware
- Logging middleware

#### Pipes
- Data validation pipes
- Transformation pipes
- Custom validation rules

#### Responses
- Standardized response formats
- Error response handling
- Success response templates

### Usage Example

```typescript
import { Controller, Get } from '@nestjs/common';
import { RpcExtendedController } from '@vechr/vechr-base';

@RpcExtendedController('service')
export class ExampleController {
  @Get()
  async getData() {
    // Your implementation
  }
}
```

## Messaging with NATS

The package includes built-in support for NATS messaging with authentication and context handling. Here are some examples of how to interact with the messaging endpoints using NATS CLI:

### Basic Request-Reply Pattern
```bash
nats --tlsca=./certificate/self-signed/yourCA.pem \
     --tlscert=./certificate/self-signed/nats/yourCert.crt \
     --tlskey=./certificate/self-signed/nats/yourKey.key \
     --server=nats://localhost:4222 \
     --trace \
     req "Autocar.ID_KWG.Molding.Dev.Service.Auth.SystemControl.getSystemProperties.A001" \
     '{}' \
     -H "Authorization: Bearer <your-access-token>" \
     -H "refresh-token: <your-refresh-token>"
```

### Example Endpoints

#### System Control
```
Subject: `Autocar.ID_KWG.Molding.Dev.Service.Auth.SystemControl.exit.A001`
Body: `'{}'`
Subject: `Autocar.ID_KWG.Molding.Dev.Service.Auth.SystemControl.getConfiguration.A001`
Body: `'{"body": {"name": "default"}}'` (default, system, environment)
Subject: `Autocar.ID_KWG.Molding.Dev.Service.Auth.SystemControl.getConfigurationNames.A001`
Body: `'{}'`
Subject: `Autocar.ID_KWG.Molding.Dev.Service.Auth.SystemControl.getConfigurationParameter.A001`
Body: `'{"body": {"paramName": "NATS_URL"}}'`
Subject: `Autocar.ID_KWG.Molding.Dev.Service.Auth.SystemControl.getControlList.A001`
Body: `'{"body": {"handlerType": "SystemMonitor"}}'`
Subject: `Autocar.ID_KWG.Molding.Dev.Service.Auth.SystemControl.getManifestData.A001`
Body: `'{}'`
Subject: `Autocar.ID_KWG.Molding.Dev.Service.Auth.SystemControl.getMemoryInfo.A001`
Body: `'{}'`
Subject: `Autocar.ID_KWG.Molding.Dev.Service.Auth.SystemControl.getStatus.A001`
Body: `'{}'`
Subject: `Autocar.ID_KWG.Molding.Dev.Service.Auth.SystemControl.getSystemProperties.A001`
Body: `'{}'`
Subject: `Autocar.ID_KWG.Molding.Dev.Service.Auth.SystemControl.restart.A001`
Body: `'{}'`
```

#### System Monitor
```
Subject: `Autocar.ID_KWG.Molding.Dev.Service.Auth.SystemMonitor.health.A001`
Body: `'{}'`
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.