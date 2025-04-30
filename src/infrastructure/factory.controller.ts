import {
  Body,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Type,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { BaseUseCase } from '../domain/usecase/base.usecase';
import Authentication from '../frameworks/shared/decorators/authentication.decorator';
import Authorization from '../frameworks/shared/decorators/authorization.decorator';
import Context from '../frameworks/shared/decorators/context.decorator';
import { IContext } from '../frameworks/shared/interceptors/context.interceptor';
import SuccessResponse from '../frameworks/shared/responses/success.response';
import UseList from '../frameworks/shared/decorators/uselist.decorator';
import { ApiFilterQuery } from '../frameworks/shared/decorators/api-filter-query.decorator';
import Serializer from '../frameworks/shared/decorators/serializer.decorator';
import {
  FilterPaginationAuditQueryValidator,
  ListAuditSerializer,
  ListPaginationAuditQueryValidator,
} from '../domain/entities/audit.entity';

/**
 * ## Factory Controller Generator
 * This method is used to generate the controller
 * @param name name of the controller
 * @param rolePrefix is used to specify the role prefix
 * @param filterPagination list pagination (validation pipe)
 * @param filterCursor list cursor (validation pipe)
 * @param listSerializer list (response)
 * @param listPaginationQuery list pagination (query)
 * @param listCursorQuery list cursor (query)
 * @param upsertSerializer upsert (response)
 * @param upsertBodyValidator upsert (body)
 * @param createSerializer create (response)
 * @param createBodyValidator create (body)
 * @param getSerializer get by id (response)
 * @param getParamValidator get by id (param)
 * @param updateSerializer update by id (response)
 * @param updateBodyValidator update by id (body)
 * @param updateParamValidator update by id (param)
 * @param deleteSerializer delete by id (response)
 * @param deleteBatchBodyValidator delete by batch ids (body)
 * @param deleteParamValidator delete by id (param)
 * @returns BaseController
 */
export function ControllerFactory<
  UpsertBody,
  CreateBody,
  UpdateBody,
  DeleteBatchBody extends { ids: string[] },
>(
  name: string,
  rolePrefix: string,
  filterPagination: Type,
  filterCursor: Type,
  listSerializer: Type,
  listPaginationQuery: Type,
  listCursorQuery: Type,
  upsertSerializer: Type,
  upsertBodyValidator: Type,
  createSerializer: Type,
  createBodyValidator: Type,
  getSerializer: Type,
  updateSerializer: Type,
  updateBodyValidator: Type,
  deleteSerializer: Type,
  deleteBatchBodyValidator: Type,
) {
  class BaseController {
    public _usecase: BaseUseCase;

    @Get('audit/:id')
    @ApiBearerAuth('access-token')
    @ApiOperation({
      summary: 'Get audit details by id',
    })
    @HttpCode(HttpStatus.OK)
    @Serializer(getSerializer)
    @Authentication(true)
    @Authorization(`audit:read@auth`)
    @ApiParam({
      name: 'id',
      example: '05fcdf7e-d39c-40d7-aae8-c7bd27088428',
      description: 'ID!',
    })
    public async getAudit(@Param('id') id: string) {
      const result = await this._usecase.getAudit(id);

      return new SuccessResponse(
        `audit of ${name} fetched successfully`,
        result,
      );
    }

    @Get('audit')
    @ApiBearerAuth('access-token')
    @ApiOperation({
      summary:
        'List of audits, you can get list of audit using page next or previous',
    })
    @HttpCode(HttpStatus.OK)
    @UseList(FilterPaginationAuditQueryValidator)
    @Serializer(ListAuditSerializer)
    @ApiFilterQuery('filters', ListPaginationAuditQueryValidator)
    @Authentication(true)
    @Authorization(`audit:read@auth`)
    public async getAudits(@Context() ctx: IContext) {
      const { result, meta } = await this._usecase.getAudits(ctx);

      return new SuccessResponse(`${name} fetched successfully`, result, meta);
    }

    @Get('')
    @ApiBearerAuth('access-token')
    @ApiOperation({
      summary:
        'Dropdown method, you can get list of items with return id and name only',
    })
    @HttpCode(HttpStatus.OK)
    @Authentication(true)
    @Authorization(`${rolePrefix}:read@auth`)
    @ApiQuery({ name: 'search', type: String, required: false })
    public async listDropdown(@Context() ctx: IContext) {
      const result = await this._usecase.listDropdown(ctx);

      return new SuccessResponse(`${name} fetched successfully`, result);
    }

    @Get('pagination')
    @ApiBearerAuth('access-token')
    @ApiOperation({
      summary:
        'List pagination method, you can get list of items using page next or previous',
    })
    @HttpCode(HttpStatus.OK)
    @UseList(filterPagination)
    @Serializer(listSerializer)
    @ApiFilterQuery('filters', listPaginationQuery)
    @Authentication(true)
    @Authorization(`${rolePrefix}:read@auth`)
    public async listPagination(@Context() ctx: IContext) {
      const { result, meta } = await this._usecase.listPagination(ctx);

      return new SuccessResponse(`${name} fetched successfully`, result, meta);
    }

    @Get('cursor')
    @ApiBearerAuth('access-token')
    @ApiOperation({
      summary:
        'List cursor method, you can get list of items using cursor or infinite scrolling',
    })
    @HttpCode(HttpStatus.OK)
    @UseList(filterCursor)
    @Serializer(listSerializer)
    @ApiFilterQuery('filters', listCursorQuery)
    @Authentication(true)
    @Authorization(`${rolePrefix}:read@auth`)
    public async listCursor(@Context() ctx: IContext) {
      const { meta, result } = await this._usecase.listCursor(ctx);

      return new SuccessResponse(`${name} fetched successfully`, result, meta);
    }

    @Put()
    @ApiBearerAuth('access-token')
    @ApiOperation({
      summary:
        'Upsert method, you can create or update item by uniqueness of name',
    })
    @HttpCode(HttpStatus.CREATED)
    @Serializer(upsertSerializer)
    @Authentication(true)
    @Authorization(`${rolePrefix}:create@auth`, `${rolePrefix}:update@auth`)
    @ApiBody({ type: upsertBodyValidator })
    public async upsert(
      @Context() ctx: IContext,
      @Body() body: UpsertBody,
    ): Promise<SuccessResponse> {
      const result = await this._usecase.upsert(ctx, body);

      return new SuccessResponse(`${name} save successfully'`, result);
    }

    @Post()
    @ApiBearerAuth('access-token')
    @ApiOperation({
      summary: 'Create method, you can create item',
    })
    @HttpCode(HttpStatus.CREATED)
    @Serializer(createSerializer)
    @Authentication(true)
    @Authorization(`${rolePrefix}:create@auth`)
    @ApiBody({ type: createBodyValidator })
    public async create(
      @Context() ctx: IContext,
      @Body() body: CreateBody,
    ): Promise<SuccessResponse> {
      const result = await this._usecase.create(ctx, body);

      return new SuccessResponse(`${name} created successfully`, result);
    }

    @Get('/:id')
    @ApiBearerAuth('access-token')
    @ApiOperation({
      summary: 'Get by id method, you can get items by id',
    })
    @HttpCode(HttpStatus.OK)
    @Serializer(getSerializer)
    @Authentication(true)
    @Authorization(`${rolePrefix}:read@auth`)
    @ApiParam({
      name: 'id',
      example: '1def564a-42d9-4a94-9bf8-c9c6e4d796a6',
      description: 'ID!',
    })
    public async get(@Context() ctx: IContext, @Param('id') id: string) {
      const result = await this._usecase.getById(ctx, id);

      return new SuccessResponse(`${name} fetched successfully`, result);
    }

    @Patch('/:id')
    @ApiBearerAuth('access-token')
    @ApiOperation({
      summary: 'Update method, you can update by id',
    })
    @HttpCode(HttpStatus.CREATED)
    @Serializer(updateSerializer)
    @Authentication(true)
    @Authorization(`${rolePrefix}:update@auth`)
    @ApiBody({ type: updateBodyValidator })
    @ApiParam({
      name: 'id',
      example: '1def564a-42d9-4a94-9bf8-c9c6e4d796a6',
      description: 'ID!',
    })
    public async update(
      @Context() ctx: IContext,
      @Param('id') id: string,
      @Body() body: UpdateBody,
    ): Promise<SuccessResponse> {
      const result = await this._usecase.update(ctx, id, body);

      return new SuccessResponse(`${name} updated successfully`, result);
    }

    @Delete('/:id')
    @ApiBearerAuth('access-token')
    @ApiOperation({
      summary: 'Delete method, you can delete item by id',
    })
    @HttpCode(HttpStatus.CREATED)
    @Serializer(deleteSerializer)
    @Authentication(true)
    @Authorization(`${rolePrefix}:delete@auth`)
    @ApiParam({
      name: 'id',
      example: '1def564a-42d9-4a94-9bf8-c9c6e4d796a6',
      description: 'ID!',
    })
    public async delete(
      @Context() ctx: IContext,
      @Param('id') id: string,
    ): Promise<SuccessResponse> {
      const result = await this._usecase.delete(ctx, id);

      return new SuccessResponse(`${name} deleted successfully`, result);
    }

    @Delete()
    @ApiBearerAuth('access-token')
    @ApiOperation({
      summary:
        'Delete batch method, you can delete multiple items by multiple id',
    })
    @HttpCode(HttpStatus.CREATED)
    @Authentication(true)
    @Authorization(`${rolePrefix}:delete@auth`)
    @ApiBody({ type: deleteBatchBodyValidator })
    public async deleteBatch(
      @Context() ctx: IContext,
      @Body() body: DeleteBatchBody,
    ): Promise<SuccessResponse> {
      const result = await this._usecase.deleteBatch(ctx, body);

      return new SuccessResponse(`${name} delete batched successfully`, result);
    }
  }

  return BaseController;
}
