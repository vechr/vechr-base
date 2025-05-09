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

## Messaging with NATS

The package includes built-in support for NATS messaging with authentication and context handling. Here are some examples of how to interact with the messaging endpoints using NATS CLI:

### Basic Request-Reply Pattern

```bash
# Get an item by ID
nats req 'vechr.{service}.get' '{"id": "123"}' --header "x-access-token: your-jwt-token"

# List items with pagination
nats req 'vechr.{service}.list' '{"page": 1, "limit": 10}' --header "x-access-token: your-jwt-token"

# Create a new item
nats req 'vechr.{service}.create' '{"name": "Example", "description": "Test item"}' --header "x-access-token: your-jwt-token"

# Update an item
nats req 'vechr.{service}.update' '{"id": "123", "name": "Updated Name"}' --header "x-access-token: your-jwt-token"

# Delete an item
nats req 'vechr.{service}.delete' '{"id": "123"}' --header "x-access-token: your-jwt-token"

# Batch delete items
nats req 'vechr.{service}.deleteBatch' '{"ids": ["123", "456"]}' --header "x-access-token: your-jwt-token"
```

### Authentication Headers

You can provide the JWT token in several ways:

```bash
# Using x-access-token header
nats req 'vechr.{service}.get' '{"id": "123"}' --header "x-access-token: your-jwt-token"

# Using authorization header
nats req 'vechr.{service}.get' '{"id": "123"}' --header "authorization: Bearer your-jwt-token"

# Using access-token header
nats req 'vechr.{service}.get' '{"id": "123"}' --header "access-token: your-jwt-token"
```

### Message Format

The message payload should be a JSON object. For example:

```json
{
  "id": "123",
  "name": "Example",
  "description": "Test item"
}
```

### Response Format

All responses follow a standard format:

```json
{
  "success": true,
  "message": "Item fetched successfully",
  "data": {
    // Response data here
  }
}
```

### Error Handling

Error responses include detailed information:

```json
{
  "success": false,
  "message": "Error message",
  "code": "ERROR_CODE",
  "params": {
    // Additional error details
  }
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.