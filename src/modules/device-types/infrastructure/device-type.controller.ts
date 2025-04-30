import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DeviceTypeUseCase } from '../domain/usecase/device-type.usecase';
import {
  CreateDeviceTypeSerializer,
  DeleteDeviceTypeSerializer,
  GetDeviceTypeSerializer,
  ListDeviceTypeSerializer,
  UpdateDeviceTypeSerializer,
  UpsertDeviceTypeSerializer,
} from '@/modules/device-types/domain/entities/device-type.serializer';
import {
  CreateDeviceTypeValidator,
  DeleteDeviceTypeBatchBodyValidator,
  FilterCursorDeviceTypeQueryValidator,
  FilterPaginationDeviceTypeQueryValidator,
  ListCursorDeviceTypeQueryValidator,
  ListPaginationDeviceTypeQueryValidator,
  UpdateDeviceTypeValidator,
  UpsertDeviceTypeValidator,
} from '@/modules/device-types/domain/entities/device-type.validator';
import { ControllerFactory } from '@/core/base/infrastructure/factory.controller';
import { OtelInstanceCounter } from 'nestjs-otel';

@ApiTags('DeviceType')
@OtelInstanceCounter()
@Controller('device-type')
export class DeviceTypeController extends ControllerFactory<
  UpsertDeviceTypeValidator,
  CreateDeviceTypeValidator,
  UpdateDeviceTypeValidator,
  DeleteDeviceTypeBatchBodyValidator
>(
  'device-type',
  'device-type',
  FilterPaginationDeviceTypeQueryValidator,
  FilterCursorDeviceTypeQueryValidator,
  ListDeviceTypeSerializer,
  ListPaginationDeviceTypeQueryValidator,
  ListCursorDeviceTypeQueryValidator,
  UpsertDeviceTypeSerializer,
  UpsertDeviceTypeValidator,
  CreateDeviceTypeSerializer,
  CreateDeviceTypeValidator,
  GetDeviceTypeSerializer,
  UpdateDeviceTypeSerializer,
  UpdateDeviceTypeValidator,
  DeleteDeviceTypeSerializer,
  DeleteDeviceTypeBatchBodyValidator,
) {
  constructor(public _usecase: DeviceTypeUseCase) {
    super();
  }
}
