import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { BadRequestException } from '../exceptions/common.exception';
import qs from 'qs';
import {
  ESortMode,
  IListCursorRequest,
  IListPaginationRequest,
} from '@/domain';

interface QueryFilters {
  pagination: IListCursorRequest | IListPaginationRequest;
  sort: {
    by: string;
    mode: ESortMode;
  };
  field?: Record<string, unknown>;
}

interface QueryParams {
  params: {
    query:
      | string
      | {
          filters: QueryFilters;
        };
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
export default class ListQueryPipe<T extends { filters: QueryFilters }>
  implements PipeTransform
{
  private readonly contextParamsProps = ['params', 'body', 'query'] as const;

  constructor(private readonly dto: ClassConstructor<T>) {
    if (!dto) {
      throw new Error('DTO class is required');
    }
  }

  /**
   * Transforms and validates the query parameters
   * @param value - The incoming query parameters
   * @param metadata - Argument metadata from NestJS
   * @returns The transformed and validated query parameters
   */
  public async transform(
    value: QueryParams,
    metadata: ArgumentMetadata,
  ): Promise<QueryParams> {
    if (!this.shouldValidate(value, metadata)) {
      return value;
    }

    const parsedQuery = this.parseQueryString(value);
    if (!this.hasValidFilters(parsedQuery)) {
      return value;
    }

    const validatedQuery = await this.validateQuery(parsedQuery);
    return {
      ...value,
      params: {
        ...value.params,
        query: {
          filters: validatedQuery.filters,
        },
      },
    };
  }

  /**
   * Parses the query string and handles JSON parsing of filter fields
   * @param value - The query parameters
   * @returns The parsed query object
   */
  private parseQueryString(value: QueryParams): Record<string, unknown> {
    // if (typeof value.params.query === 'string') {
    const queryJson = qs.parse(value.params.query as any) as Record<
      string,
      unknown
    >;
    const filters = queryJson.filters as Record<string, unknown>;

    if (filters) {
      ['pagination', 'sort', 'field'].forEach((key) => {
        if (typeof filters[key] === 'string') {
          try {
            filters[key] = JSON.parse(filters[key] as string);
          } catch (error) {
            throw new BadRequestException({
              message: `Invalid JSON in ${key} filter`,
              params: [
                {
                  field: key,
                  value: filters[key],
                  errors: 'Invalid JSON format' + error,
                },
              ],
            });
          }
        }
      });
    }

    return queryJson;
    // }
    // return value.params.query as Record<string, unknown>;
  }

  /**
   * Validates the query against the DTO
   * @param query - The query to validate
   * @returns The validated query
   */
  private async validateQuery(query: Record<string, unknown>): Promise<T> {
    const convertQuery = plainToClass(this.dto, query);
    const errors = await validate(convertQuery);

    if (errors.length > 0) {
      const validationErrors: ValidationError[] = errors.map((err) => ({
        field: err.property,
        value: err.value,
        errors: Object.values(err.constraints || {}).join(', '),
      }));

      throw new BadRequestException({
        message: 'Validation failed',
        params: validationErrors,
      });
    }

    return convertQuery;
  }

  /**
   * Checks if the query has valid filters that need validation
   * @param query - The parsed query
   * @returns Whether the query has valid filters
   */
  private hasValidFilters(query: Record<string, unknown>): boolean {
    const filters = query.filters as Record<string, unknown>;
    return Boolean(
      filters?.pagination &&
        filters?.sort &&
        Object.keys(filters.sort).length > 0,
    );
  }

  /**
   * Determines if validation should be performed
   * @param value - The query parameters
   * @param metadata - Argument metadata
   * @returns Whether validation should be performed
   */
  private shouldValidate(
    value: QueryParams,
    metadata: ArgumentMetadata,
  ): boolean {
    if (metadata.type !== 'custom') {
      return false;
    }

    const isContext = this.isValidContext(value);
    const isContextParams = this.isValidContextParams(value);

    return isContext || isContextParams;
  }

  /**
   * Checks if the value is a valid context object
   * @param value - The value to check
   * @returns Whether the value is a valid context
   */
  private isValidContext(value: QueryParams): boolean {
    return Boolean(
      value.params &&
        Object.keys(value.params).length === 3 &&
        Object.keys(value.params).every((prop) =>
          this.contextParamsProps.includes(prop as any),
        ),
    );
  }

  /**
   * Checks if the value is a valid context params object
   * @param value - The value to check
   * @returns Whether the value is a valid context params
   */
  private isValidContextParams(value: QueryParams): boolean {
    return Boolean(
      value &&
        Object.keys(value).length === 3 &&
        Object.keys(value).every((prop) =>
          this.contextParamsProps.includes(prop as any),
        ),
    );
  }
}
