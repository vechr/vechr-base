import { Type } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { SubjectFactory } from '../modules/messaging/domain/usecases/factories/subject.factory';
import { BaseUseCase } from '../domain/usecase/base.usecase';
import { SuccessResponse } from '../frameworks/shared/responses/success.response';
import { IContext } from '../frameworks/shared/interceptors/context.interceptor';
import { ExtendedSerializer } from '../frameworks/shared/decorators/serializer.decorator';
import { Authentication } from '../frameworks/shared/decorators/authentication.decorator';
import { Authorization } from '../frameworks/shared/decorators/authorization.decorator';
import { Context } from '../frameworks/shared/decorators/context.decorator';

/**
 * ## Factory Messaging Controller Generator
 * This method is used to generate the messaging controller with request-reply pattern
 * @param name name of the controller
 * @param messageType type of message (e.g., 'SystemControl', 'SystemMonitor')
 * @param rolePrefix is used to specify the role prefix
 * @param getSerializer get by id (response)
 * @param listSerializer list (response)
 * @param createSerializer create (response)
 * @param updateSerializer update (response)
 * @param deleteSerializer delete (response)
 * @returns BaseMessagingController
 */
export function MessagingControllerFactory<
  CreateBody,
  UpdateBody,
  DeleteBody extends { ids: string[] },
>(
  name: string,
  messageType: string,
  rolePrefix: string,
  getSerializer: Type,
  listSerializer: Type,
  createSerializer: Type,
  updateSerializer: Type,
  deleteSerializer: Type,
) {
  class BaseMessagingController {
    public _usecase: BaseUseCase;

    @MessagePattern(SubjectFactory.buildSubject(messageType, 'get'))
    @ExtendedSerializer(getSerializer)
    @Authentication(true)
    @Authorization(`${rolePrefix}:read@auth`)
    async get(@Context() ctx: IContext, data: { id: string }) {
      const result = await this._usecase.getById(ctx, data.id);

      return new SuccessResponse(`${name} fetched successfully`, result);
    }

    @MessagePattern(SubjectFactory.buildSubject(messageType, 'list'))
    @ExtendedSerializer(listSerializer)
    @Authentication(true)
    @Authorization(`${rolePrefix}:read@auth`)
    async list(@Context() ctx: IContext, _data: any) {
      const result = await this._usecase.listPagination(ctx);

      return new SuccessResponse(`${name} list fetched successfully`, result);
    }

    @MessagePattern(SubjectFactory.buildSubject(messageType, 'create'))
    @ExtendedSerializer(createSerializer)
    @Authentication(true)
    @Authorization(`${rolePrefix}:create@auth`)
    async create(@Context() ctx: IContext, data: CreateBody) {
      const result = await this._usecase.create(ctx, data);

      return new SuccessResponse(`${name} created successfully`, result);
    }

    @MessagePattern(SubjectFactory.buildSubject(messageType, 'update'))
    @ExtendedSerializer(updateSerializer)
    @Authentication(true)
    @Authorization(`${rolePrefix}:update@auth`)
    async update(@Context() ctx: IContext, data: { id: string } & UpdateBody) {
      const { id, ...body } = data;
      const result = await this._usecase.update(ctx, id, body);

      return new SuccessResponse(`${name} updated successfully`, result);
    }

    @MessagePattern(SubjectFactory.buildSubject(messageType, 'delete'))
    @ExtendedSerializer(deleteSerializer)
    @Authentication(true)
    @Authorization(`${rolePrefix}:delete@auth`)
    async delete(@Context() ctx: IContext, data: { id: string }) {
      const result = await this._usecase.delete(ctx, data.id);

      return new SuccessResponse(`${name} deleted successfully`, result);
    }

    @MessagePattern(SubjectFactory.buildSubject(messageType, 'deleteBatch'))
    @ExtendedSerializer(deleteSerializer)
    @Authentication(true)
    @Authorization(`${rolePrefix}:delete@auth`)
    async deleteBatch(@Context() ctx: IContext, data: DeleteBody) {
      const result = await this._usecase.deleteBatch(ctx, data);

      return new SuccessResponse(`${name} batch deleted successfully`, result);
    }
  }

  return BaseMessagingController;
}
