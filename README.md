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