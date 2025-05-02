import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiQuery, getSchemaPath } from '@nestjs/swagger';

/**
 * Combines Swagger Decorators to create a description for `filters[name]=something`
 *  - has support for swagger
 *  - automatic transformation with nestjs
 */

interface ClassConstructor {
  new (...args: any[]): any;
}

/**
 * The function `ApiFilterQuery` generates API query parameters for filtering based on a specified
 * field name and filter DTO class.
 * @param {string} fieldName - The `fieldName` parameter in the `ApiFilterQuery` function represents
 * the name of the query parameter that will be used in the API endpoint to filter the data based on
 * the specified criteria. It is a string value that defines the name of the filter field in the query
 * string.
 * @param {ClassConstructor} filterDto - The `filterDto` parameter in the `ApiFilterQuery` function is
 * a class constructor that represents the data transfer object (DTO) used for filtering API queries.
 * It defines the structure of the filter object that will be passed as a query parameter in API
 * requests. This DTO class typically contains properties that
 * @returns The `ApiFilterQuery` function returns a decorator that can be used to apply metadata to a
 * class property or method in a TypeScript class. The decorator includes information about the API
 * query parameters for filtering data, such as the field name, filter DTO (Data Transfer Object), and
 * additional details like required status, style, type, and description. The decorator also references
 * an external schema for validation and documentation purposes
 */
export function ApiFilterQuery(fieldName: string, filterDto: ClassConstructor) {
  return applyDecorators(
    ApiExtraModels(filterDto),
    ApiQuery({
      required: false,
      name: fieldName,
      style: 'deepObject',
      explode: false,
      type: 'object',
      description: `Example: http://your_host:your_port/your_route?filters[pagination][limit]=2&filters[pagination][page]=1&filters[sort][by]=createdAt&filters[sort][mode]=asc&filters[field][name][contains]=something about name </br> </br>
         You can filter more than this, please refer to this https://www.prisma.io/docs/reference/api-reference/prisma-client-reference#filter-conditions-and-operators`,
      schema: {
        $ref: getSchemaPath(filterDto),
      },
    }),
  );
}
