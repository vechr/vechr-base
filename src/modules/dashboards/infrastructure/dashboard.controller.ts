import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DashboardUseCase } from '../domain/usecase/dashboard.usecase';
import {
  CreateDashboardSerializer,
  DeleteDashboardSerializer,
  GetDashboardSerializer,
  ListDashboardSerializer,
  UpdateDashboardSerializer,
  UpsertDashboardSerializer,
} from '@/modules/dashboards/domain/entities/dashboard.serializer';
import {
  CreateDashboardValidator,
  DeleteDashboardBatchBodyValidator,
  FilterCursorDashboardQueryValidator,
  FilterPaginationDashboardQueryValidator,
  ListCursorDashboardQueryValidator,
  ListPaginationDashboardQueryValidator,
  UpdateDashboardValidator,
  UpsertDashboardValidator,
} from '@/modules/dashboards/domain/entities/dashboard.validator';
import { ControllerFactory } from '@/core/base/infrastructure/factory.controller';
import { OtelInstanceCounter } from 'nestjs-otel';
import Authentication from '@/core/base/frameworks/shared/decorators/authentication.decorator';
import Authorization from '@/core/base/frameworks/shared/decorators/authorization.decorator';
import SuccessResponse from '@/core/base/frameworks/shared/responses/success.response';

@ApiTags('Dashboard')
@OtelInstanceCounter()
@Controller('dashboard')
export class DashboardController extends ControllerFactory<
  UpsertDashboardValidator,
  CreateDashboardValidator,
  UpdateDashboardValidator,
  DeleteDashboardBatchBodyValidator
>(
  'dashboard',
  'dashboard',
  FilterPaginationDashboardQueryValidator,
  FilterCursorDashboardQueryValidator,
  ListDashboardSerializer,
  ListPaginationDashboardQueryValidator,
  ListCursorDashboardQueryValidator,
  UpsertDashboardSerializer,
  UpsertDashboardValidator,
  CreateDashboardSerializer,
  CreateDashboardValidator,
  GetDashboardSerializer,
  UpdateDashboardSerializer,
  UpdateDashboardValidator,
  DeleteDashboardSerializer,
  DeleteDashboardBatchBodyValidator,
) {
  constructor(public _usecase: DashboardUseCase) {
    super();
  }

  @Get('details')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get all dashboard with information details',
  })
  @Authentication(true)
  @Authorization(`dashboard:read@auth`)
  public async getDashboardDetails(): Promise<SuccessResponse> {
    const result = await this._usecase.getAllDashboardWithDetails();
    return new SuccessResponse('Success get all records!', result);
  }
}
