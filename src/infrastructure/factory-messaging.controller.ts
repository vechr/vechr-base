import { Body, Type } from '@nestjs/common';
import { SubjectFactory } from '../modules/messaging/domain/usecases/factories/subject.factory';
import { BaseUseCase } from '../domain/usecase/base.usecase';
import { SuccessResponse } from '../frameworks/shared/responses/success.response';
import { IContext } from '../frameworks/shared/interceptors/context.interceptor';
import { ExtendedSerializer } from '../frameworks/shared/decorators/serializer.decorator';
import { Context } from '../frameworks/shared/decorators/context.decorator';
import {
  FilterPaginationAuditQueryValidator,
  ListAuditSerializer,
} from '../domain/entities/audit.entity';
import { LoggedMessagePattern, RpcAuth, RpcUseList } from '@/frameworks';
import { IDValidator } from '@/domain';
import { OtelMethodCounter } from 'nestjs-otel';

/**
 * ## Factory Messaging Controller Generator
 * This method is used to generate the messaging controller with request-reply pattern
 * @param name name of the controller
 * @param messageType type of message (e.g., 'SystemControl', 'SystemMonitor')
 * @param rolePrefix is used to specify the role prefix
 * @param filterPagination list pagination (validation pipe)
 * @param filterCursor list cursor (validation pipe)
 * @param listSerializer list (response)
 * @param upsertSerializer upsert (response)
 * @param createSerializer create (response)
 * @param getSerializer get by id (response)
 * @param updateSerializer update (response)
 * @param deleteSerializer delete (response)
 */
export function MessagingControllerFactory<
  UpsertBody,
  CreateBody,
  UpdateBody,
  DeleteBatchBody extends { ids: string[] },
>(
  name: string,
  rolePrefix: string,
  messageType: string,
  filterPagination: Type,
  filterCursor: Type,
  listSerializer: Type,
  upsertSerializer: Type,
  createSerializer: Type,
  getSerializer: Type,
  updateSerializer: Type,
  deleteSerializer: Type,
) {
  class BaseMessagingController {
    public _usecase: BaseUseCase;

    @LoggedMessagePattern(SubjectFactory.buildSubject(messageType, 'getAudit'))
    @ExtendedSerializer(getSerializer)
    @RpcAuth(`audit:read@auth`)
    @OtelMethodCounter()
    async getAudit(@Body() data: IDValidator) {
      const result = await this._usecase.getAudit(data.id);

      return new SuccessResponse(
        `audit of ${name} fetched successfully`,
        result,
      );
    }

    @LoggedMessagePattern(SubjectFactory.buildSubject(messageType, 'getAudits'))
    @RpcUseList(FilterPaginationAuditQueryValidator)
    @ExtendedSerializer(ListAuditSerializer)
    @RpcAuth(`audit:read@auth`)
    @OtelMethodCounter()
    async getAudits(@Context() ctx: IContext) {
      const { result, meta } = await this._usecase.getAudits(ctx);

      return new SuccessResponse(`${name} fetched successfully`, result, meta);
    }

    @LoggedMessagePattern(
      SubjectFactory.buildSubject(messageType, 'listDropdown'),
    )
    @RpcAuth(`${rolePrefix}:read@auth`)
    @OtelMethodCounter()
    async listDropdown(@Context() ctx: IContext) {
      const result = await this._usecase.listDropdown(ctx);

      return new SuccessResponse(`${name} fetched successfully`, result);
    }

    @LoggedMessagePattern(
      SubjectFactory.buildSubject(messageType, 'listPagination'),
    )
    @RpcUseList(filterPagination)
    @ExtendedSerializer(listSerializer)
    @RpcAuth(`${rolePrefix}:read@auth`)
    @OtelMethodCounter()
    async listPagination(@Context() ctx: IContext) {
      const { result, meta } = await this._usecase.listPagination(ctx);

      return new SuccessResponse(`${name} fetched successfully`, result, meta);
    }

    @LoggedMessagePattern(
      SubjectFactory.buildSubject(messageType, 'listCursor'),
    )
    @RpcUseList(filterCursor)
    @ExtendedSerializer(listSerializer)
    @RpcAuth(`${rolePrefix}:read@auth`)
    @OtelMethodCounter()
    async listCursor(@Context() ctx: IContext) {
      const { meta, result } = await this._usecase.listCursor(ctx);

      return new SuccessResponse(`${name} fetched successfully`, result, meta);
    }

    @LoggedMessagePattern(SubjectFactory.buildSubject(messageType, 'upsert'))
    @ExtendedSerializer(upsertSerializer)
    @RpcAuth(`${rolePrefix}:create@auth`, `${rolePrefix}:update@auth`)
    @OtelMethodCounter()
    async upsert(@Context() ctx: IContext, @Body() data: UpsertBody) {
      const result = await this._usecase.upsert(ctx, data);

      return new SuccessResponse(`${name} save successfully`, result);
    }

    @LoggedMessagePattern(SubjectFactory.buildSubject(messageType, 'create'))
    @ExtendedSerializer(createSerializer)
    @RpcAuth(`${rolePrefix}:create@auth`)
    @OtelMethodCounter()
    async create(@Context() ctx: IContext, @Body() data: CreateBody) {
      const result = await this._usecase.create(ctx, data);

      return new SuccessResponse(`${name} created successfully`, result);
    }

    @LoggedMessagePattern(SubjectFactory.buildSubject(messageType, 'get'))
    @ExtendedSerializer(getSerializer)
    @RpcAuth(`${rolePrefix}:read@auth`)
    @OtelMethodCounter()
    async get(@Context() ctx: IContext, @Body() data: IDValidator) {
      const result = await this._usecase.getById(ctx, data.id);

      return new SuccessResponse(`${name} fetched successfully`, result);
    }

    @LoggedMessagePattern(SubjectFactory.buildSubject(messageType, 'update'))
    @ExtendedSerializer(updateSerializer)
    @RpcAuth(`${rolePrefix}:update@auth`)
    @OtelMethodCounter()
    async update(
      @Context() ctx: IContext,
      @Body() data: UpdateBody & IDValidator,
    ) {
      const { id, ...body } = data;
      const result = await this._usecase.update(ctx, id, body);

      return new SuccessResponse(`${name} updated successfully`, result);
    }

    @LoggedMessagePattern(SubjectFactory.buildSubject(messageType, 'delete'))
    @ExtendedSerializer(deleteSerializer)
    @RpcAuth(`${rolePrefix}:delete@auth`)
    @OtelMethodCounter()
    async delete(@Context() ctx: IContext, @Body() data: IDValidator) {
      const result = await this._usecase.delete(ctx, data.id);

      return new SuccessResponse(`${name} deleted successfully`, result);
    }

    @LoggedMessagePattern(
      SubjectFactory.buildSubject(messageType, 'deleteBatch'),
    )
    @ExtendedSerializer(deleteSerializer)
    @RpcAuth(`${rolePrefix}:delete@auth`)
    @OtelMethodCounter()
    async deleteBatch(@Context() ctx: IContext, @Body() data: DeleteBatchBody) {
      const result = await this._usecase.deleteBatch(ctx, data);

      return new SuccessResponse(`${name} batch deleted successfully`, result);
    }
  }

  return BaseMessagingController;
}
