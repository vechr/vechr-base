import { ESortMode } from '@/domain';
import { IListPaginationRequest } from '@/domain';
import { IListCursorRequest } from '@/domain';
import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { RpcBadRequestException } from '../exceptions';

interface QueryFilters {
  pagination: IListCursorRequest | IListPaginationRequest;
  sort: {
    by: string;
    mode: ESortMode;
  };
  field?: Record<string, unknown>;
}

interface Query {
  query: {
    filters: QueryFilters;
  };
}

interface ValidationError {
  field: string;
  value: unknown;
  errors: string;
}

interface ClassConstructor<T = any> {
  new (...args: any[]): T;
}

@Injectable()
export class RpcListQueryPipe<T extends { filters: QueryFilters }>
  implements PipeTransform
{
  constructor(private readonly dto: ClassConstructor<T>) {
    if (!dto) {
      throw new Error('DTO class is required');
    }
  }

  /**
   * Transforms and validates the RPC message data for list queries
   * @param value - The incoming RPC message data
   * @param metadata - Argument metadata from NestJS
   * @returns The transformed and validated query parameters
   */
  public async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
    if (!this.shouldValidate(value, metadata)) {
      return value;
    }

    if (!this.hasValidFilters(value)) {
      return value;
    }

    const validatedQuery = await this.validateQuery(value);
    value.query = validatedQuery;
    return value;
  }

  /**
   * Validates the query against the DTO
   * @param query - The query to validate
   * @returns The validated query
   */
  private async validateQuery(val: Query): Promise<T> {
    const convertQuery = plainToClass(this.dto, val.query);
    const errors = await validate(convertQuery);

    if (errors.length > 0) {
      const validationErrors: ValidationError[] = errors.map((err) => ({
        field: err.property,
        value: err.value,
        errors: Object.values(err.constraints || {}).join(', '),
      }));

      throw new RpcBadRequestException({
        message: 'Validation failed',
        params: validationErrors,
      });
    }

    return convertQuery;
  }

  /**
   * Checks if the query has valid filters that need validation
   * @param query - The query data
   * @returns Whether the query has valid filters
   */
  private hasValidFilters(value: Query): boolean {
    const filters = value.query.filters;
    return Boolean(
      filters?.pagination &&
        filters?.sort &&
        Object.keys(filters.sort).length > 0,
    );
  }

  /**
   * Determines if validation should be performed
   * @param value - The query data
   * @param metadata - Argument metadata
   * @returns Whether validation should be performed
   */
  private shouldValidate(value: Query, metadata: ArgumentMetadata): boolean {
    if (metadata.type !== 'body') {
      return false;
    }

    if (value.query) {
      return true;
    }

    return false;
  }
}
