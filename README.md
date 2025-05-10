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

# Get audit details by ID
nats req 'vechr.{service}.getAudit' '{"id": "123"}' --header "x-access-token: your-jwt-token"

# List audits with pagination
nats req 'vechr.{service}.getAudits' '{
  "filters": {
    "pagination": {
      "page": 1,
      "limit": 10
    }
  }
}' --header "x-access-token: your-jwt-token"

# Get dropdown list (id and name only)
nats req 'vechr.{service}.listDropdown' '{}' --header "x-access-token: your-jwt-token"

# List with page-based pagination
nats req 'vechr.{service}.listPagination' '{
  "filters": {
    "pagination": {
      "page": 1,
      "limit": 10
    },
    "sort": {
      "by": "createdAt",
      "mode": "DESC"
    }
  }
}' --header "x-access-token: your-jwt-token"

# List with cursor-based pagination
nats req 'vechr.{service}.listCursor' '{
  "filters": {
    "pagination": {
      "cursor": "last-item-id",
      "limit": 10
    },
    "sort": {
      "by": "createdAt",
      "mode": "DESC"
    }
  }
}' --header "x-access-token: your-jwt-token"

# Create or update by uniqueness
nats req 'vechr.{service}.upsert' '{
  "name": "Example",
  "description": "Test item"
}' --header "x-access-token: your-jwt-token"

# Create a new item
nats req 'vechr.{service}.create' '{"name": "Example", "description": "Test item"}' --header "x-access-token: your-jwt-token"

# Update an item
nats req 'vechr.{service}.update' '{"id": "123", "name": "Updated Name"}' --header "x-access-token: your-jwt-token"

# Delete an item
nats req 'vechr.{service}.delete' '{"id": "123"}' --header "x-access-token: your-jwt-token"

# Batch delete items
nats req 'vechr.{service}.deleteBatch' '{"ids": ["123", "456"]}' --header "x-access-token: your-jwt-token"
```

### List Query with Pagination and Sorting

The package includes a `ListQueryRpcPipe` for handling list queries with pagination and sorting. Here's how to use it:

1. Define your DTO with the correct structure:
```typescript
class UserListDto {
  filters: {
    pagination: {
      page: number;
      limit: number;
    };
    sort: {
      by: string;
      mode: ESortMode;
    };
    field?: {
      status?: string;
      role?: string;
    };
  };
}
```

2. Use the pipe in your controller:
```typescript
@Controller()
export class UserController {
  constructor(private readonly userService: IUserService) {}

  @MessagePattern('vechr.users.list')
  @UsePipes(new ListQueryRpcPipe(UserListDto))
  async list(
    @Context() ctx: IContext,
    @Payload() data: UserListDto,
  ): Promise<SuccessResponse> {
    const result = await this.userService.list(ctx, data.filters);
    return new SuccessResponse('Users fetched successfully', result);
  }
}
```

3. Call the endpoint using NATS CLI:
```bash
# List with cursor-based pagination
nats req 'vechr.{service}.list' '{
  "filters": {
    "pagination": {
      "cursor": "last-item-id",
      "limit": 10
    },
    "sort": {
      "by": "createdAt",
      "mode": "DESC"
    }
  }
}' --header "x-access-token: your-jwt-token"

# List with offset-based pagination
nats req 'vechr.{service}.list' '{
  "filters": {
    "pagination": {
      "page": 1,
      "limit": 10
    },
    "sort": {
      "by": "name",
      "mode": "ASC"
    }
  }
}' --header "x-access-token: your-jwt-token"

# List with field filters
nats req 'vechr.{service}.list' '{
  "filters": {
    "pagination": {
      "page": 1,
      "limit": 10
    },
    "sort": {
      "by": "createdAt",
      "mode": "DESC"
    },
    "field": {
      "status": "active",
      "type": "user"
    }
  }
}' --header "x-access-token: your-jwt-token"
```

The pipe provides:
- Automatic validation of pagination, sorting, and field filters
- Type safety using class-transformer and class-validator
- Integration with your context system for authentication
- Standard error responses for validation failures

Example response:
```json
{
  "success": true,
  "message": "Users fetched successfully",
  "data": {
    "items": [...],
    "total": 100,
    "page": 1,
    "limit": 10
  }
}
```

Example error response (if validation fails):
```json
{
  "success": false,
  "message": "Validation failed",
  "code": "R400",
  "params": [
    {
      "field": "filters.pagination.limit",
      "value": "invalid",
      "errors": "limit must be a number"
    }
  ]
}
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