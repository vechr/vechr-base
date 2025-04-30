import { Controller, Get, Param } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { WidgetUseCase } from '../domain/usecase/widget.usecase';
import {
  CreateWidgetSerializer,
  DeleteWidgetSerializer,
  GetWidgetSerializer,
  ListWidgetSerializer,
  UpdateWidgetSerializer,
  UpsertWidgetSerializer,
} from '@/modules/widgets/domain/entities/widget.serializer';
import {
  CreateWidgetValidator,
  DeleteWidgetBatchBodyValidator,
  FilterCursorWidgetQueryValidator,
  FilterPaginationWidgetQueryValidator,
  ListCursorWidgetQueryValidator,
  ListPaginationWidgetQueryValidator,
  UpdateWidgetValidator,
  UpsertWidgetValidator,
} from '@/modules/widgets/domain/entities/widget.validator';
import { ControllerFactory } from '@/core/base/infrastructure/factory.controller';
import { OtelInstanceCounter } from 'nestjs-otel';
import Authentication from '@/core/base/frameworks/shared/decorators/authentication.decorator';
import Authorization from '@/core/base/frameworks/shared/decorators/authorization.decorator';
import SuccessResponse from '@/core/base/frameworks/shared/responses/success.response';

@ApiTags('Widget')
@OtelInstanceCounter()
@Controller('widget')
export class WidgetController extends ControllerFactory<
  UpsertWidgetValidator,
  CreateWidgetValidator,
  UpdateWidgetValidator,
  DeleteWidgetBatchBodyValidator
>(
  'widget',
  'widget',
  FilterPaginationWidgetQueryValidator,
  FilterCursorWidgetQueryValidator,
  ListWidgetSerializer,
  ListPaginationWidgetQueryValidator,
  ListCursorWidgetQueryValidator,
  UpsertWidgetSerializer,
  UpsertWidgetValidator,
  CreateWidgetSerializer,
  CreateWidgetValidator,
  GetWidgetSerializer,
  UpdateWidgetSerializer,
  UpdateWidgetValidator,
  DeleteWidgetSerializer,
  DeleteWidgetBatchBodyValidator,
) {
  constructor(public _usecase: WidgetUseCase) {
    super();
  }

  @Get('dashboard/:id')
  @Authentication(true)
  @Authorization('widget:read@auth')
  @ApiParam({
    name: 'id',
    example: '1def564a-42d9-4a94-9bf8-c9c6e4d796a6',
    description: 'ID!',
  })
  public async getAllWidgetByDashboardId(
    @Param('id') id: string,
  ): Promise<SuccessResponse> {
    const result = await this._usecase.getAllWidgetByDashboardId(id);
    return new SuccessResponse('Success get all record!', result);
  }
}
