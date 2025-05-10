import { Type } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { SubjectFactory } from '../modules/messaging/domain/usecases/factories/subject.factory';
import { BaseUseCase } from '../domain/usecase/base.usecase';
import { SuccessResponse } from '../frameworks/shared/responses/success.response';
import { IContext } from '../frameworks/shared/interceptors/context.interceptor';
import { ExtendedSerializer } from '../frameworks/shared/decorators/serializer.decorator';
import { Authorization } from '../frameworks/shared/decorators/authorization.decorator';
import { Context } from '../frameworks/shared/decorators/context.decorator';
import { UseList } from '../frameworks/shared/decorators/uselist.decorator';
import {
  FilterPaginationAuditQueryValidator,
  ListAuditSerializer,
} from '../domain/entities/audit.entity';

/**
 * ## Factory Messaging Controller Generator
 * This method is used to generate the messaging controller with request-reply pattern
 * @param name name of the controller
 * @param messageType type of message (e.g., 'SystemControl', 'SystemMonitor')
 * @param rolePrefix is used to specify the role prefix
 * @param filterPagination list pagination (validation pipe)
 * @param filterCursor list cursor (validation pipe)
 * @param getSerializer get by id (response)
 * @param listSerializer list (response)
 * @param createSerializer create (response)
 * @param updateSerializer update (response)
 * @param deleteSerializer delete (response)
 * @param upsertSerializer upsert (response)
 * @returns BaseMessagingController
 */
export function MessagingControllerFactory<
  UpsertBody,
  CreateBody,
  UpdateBody,
  DeleteBatchBody extends { ids: string[] },
>(
  name: string,
  messageType: string,
  rolePrefix: string,
  listSerializer: Type,
  listPaginationQuery: Type,
  listCursorQuery: Type,
  upsertSerializer: Type,
  createSerializer: Type,
  getSerializer: Type,
  updateSerializer: Type,
  deleteSerializer: Type,
) {
  class BaseMessagingController {
    public _usecase: BaseUseCase;

    @MessagePattern(SubjectFactory.buildSubject(messageType, 'getAudit'))
    @ExtendedSerializer(getSerializer)
    @Authorization(`audit:read@auth`)
    async getAudit(data: { id: string }) {
      const result = await this._usecase.getAudit(data.id);

      return new SuccessResponse(
        `audit of ${name} fetched successfully`,
        result,
      );
    }

    @MessagePattern(SubjectFactory.buildSubject(messageType, 'getAudits'))
    @UseList(FilterPaginationAuditQueryValidator)
    @ExtendedSerializer(ListAuditSerializer)
    @Authorization(`audit:read@auth`)
    async getAudits(@Context() ctx: IContext) {
      const { result, meta } = await this._usecase.getAudits(ctx);

      return new SuccessResponse(`${name} fetched successfully`, result, meta);
    }

    @MessagePattern(SubjectFactory.buildSubject(messageType, 'listDropdown'))
    @Authorization(`${rolePrefix}:read@auth`)
    async listDropdown(@Context() ctx: IContext) {
      const result = await this._usecase.listDropdown(ctx);

      return new SuccessResponse(`${name} fetched successfully`, result);
    }

    @MessagePattern(SubjectFactory.buildSubject(messageType, 'listPagination'))
    @UseList(listPaginationQuery)
    @ExtendedSerializer(listSerializer)
    @Authorization(`${rolePrefix}:read@auth`)
    async listPagination(@Context() ctx: IContext) {
      const { result, meta } = await this._usecase.listPagination(ctx);

      return new SuccessResponse(`${name} fetched successfully`, result, meta);
    }

    @MessagePattern(SubjectFactory.buildSubject(messageType, 'listCursor'))
    @UseList(listCursorQuery)
    @ExtendedSerializer(listSerializer)
    @Authorization(`${rolePrefix}:read@auth`)
    async listCursor(@Context() ctx: IContext) {
      const { meta, result } = await this._usecase.listCursor(ctx);

      return new SuccessResponse(`${name} fetched successfully`, result, meta);
    }

    @MessagePattern(SubjectFactory.buildSubject(messageType, 'upsert'))
    @ExtendedSerializer(upsertSerializer)
    @Authorization(`${rolePrefix}:create@auth`, `${rolePrefix}:update@auth`)
    async upsert(@Context() ctx: IContext, data: UpsertBody) {
      const result = await this._usecase.upsert(ctx, data);

      return new SuccessResponse(`${name} save successfully`, result);
    }

    @MessagePattern(SubjectFactory.buildSubject(messageType, 'get'))
    @ExtendedSerializer(getSerializer)
    @Authorization(`${rolePrefix}:read@auth`)
    async get(@Context() ctx: IContext, data: { id: string }) {
      const result = await this._usecase.getById(ctx, data.id);

      return new SuccessResponse(`${name} fetched successfully`, result);
    }

    @MessagePattern(SubjectFactory.buildSubject(messageType, 'list'))
    @ExtendedSerializer(listSerializer)
    @Authorization(`${rolePrefix}:read@auth`)
    async list(@Context() ctx: IContext, _data: any) {
      const result = await this._usecase.listPagination(ctx);

      return new SuccessResponse(`${name} list fetched successfully`, result);
    }

    @MessagePattern(SubjectFactory.buildSubject(messageType, 'create'))
    @ExtendedSerializer(createSerializer)
    @Authorization(`${rolePrefix}:create@auth`)
    async create(@Context() ctx: IContext, data: CreateBody) {
      const result = await this._usecase.create(ctx, data);

      return new SuccessResponse(`${name} created successfully`, result);
    }

    @MessagePattern(SubjectFactory.buildSubject(messageType, 'update'))
    @ExtendedSerializer(updateSerializer)
    @Authorization(`${rolePrefix}:update@auth`)
    async update(@Context() ctx: IContext, data: { id: string } & UpdateBody) {
      const { id, ...body } = data;
      const result = await this._usecase.update(ctx, id, body);

      return new SuccessResponse(`${name} updated successfully`, result);
    }

    @MessagePattern(SubjectFactory.buildSubject(messageType, 'delete'))
    @ExtendedSerializer(deleteSerializer)
    @Authorization(`${rolePrefix}:delete@auth`)
    async delete(@Context() ctx: IContext, data: { id: string }) {
      const result = await this._usecase.delete(ctx, data.id);

      return new SuccessResponse(`${name} deleted successfully`, result);
    }

    @MessagePattern(SubjectFactory.buildSubject(messageType, 'deleteBatch'))
    @ExtendedSerializer(deleteSerializer)
    @Authorization(`${rolePrefix}:delete@auth`)
    async deleteBatch(@Context() ctx: IContext, data: DeleteBatchBody) {
      const result = await this._usecase.deleteBatch(ctx, data);

      return new SuccessResponse(`${name} batch deleted successfully`, result);
    }
  }

  return BaseMessagingController;
}
