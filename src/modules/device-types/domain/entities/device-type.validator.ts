import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, ValidateNested } from 'class-validator';
import { DeviceType, Prisma } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  TCreateDeviceTypeRequestBody,
  TListDeviceTypeRequestQuery,
  TUpdateDeviceTypeRequestBody,
  TUpsertDeviceTypeRequestBody,
} from './device-type.entity';
import {
  BaseCursorQueryValidator,
  BasePaginationQueryValidator,
  IListCursorRequest,
  IListPaginationRequest,
  ListQueryField,
} from '@/core/base/domain/entities';
import {
  CreateValidator,
  IDsValidator,
  UpdateValidator,
} from '@/core/base/domain/entities/validator.entity';

// For field filter in list whether cursor or pagination
export class ListDeviceTypeQueryField
  extends ListQueryField
  implements Prisma.DeviceTypeWhereInput {}

// Create filters class for Cursor Type
export class ListCursorDeviceTypeQueryValidator extends BaseCursorQueryValidator<DeviceType> {
  @ValidateNested()
  @IsOptional()
  @IsObject()
  @Type(() => ListDeviceTypeQueryField)
  @ApiPropertyOptional({ type: ListDeviceTypeQueryField })
  field?: ListDeviceTypeQueryField;
}

// Create filters class for Pagination Type
export class ListPaginationDeviceTypeQueryValidator extends BasePaginationQueryValidator<DeviceType> {
  @ValidateNested()
  @IsOptional()
  @IsObject()
  @Type(() => ListDeviceTypeQueryField)
  @ApiPropertyOptional({ type: ListDeviceTypeQueryField })
  field?: ListDeviceTypeQueryField;
}

// implement filter class for Cursor Type
export class FilterCursorDeviceTypeQueryValidator
  implements TListDeviceTypeRequestQuery<IListCursorRequest>
{
  @ValidateNested()
  @IsOptional()
  @IsObject()
  @Type(() => ListCursorDeviceTypeQueryValidator)
  filters: ListCursorDeviceTypeQueryValidator;
}

// implement filter class for Pagination Type
export class FilterPaginationDeviceTypeQueryValidator
  implements TListDeviceTypeRequestQuery<IListPaginationRequest>
{
  @ValidateNested()
  @IsOptional()
  @IsObject()
  @Type(() => ListPaginationDeviceTypeQueryValidator)
  filters: ListPaginationDeviceTypeQueryValidator;
}

export class CreateDeviceTypeValidator
  extends CreateValidator
  implements TCreateDeviceTypeRequestBody {}

export class DeleteDeviceTypeBatchBodyValidator extends IDsValidator {}

export class UpsertDeviceTypeValidator
  extends CreateDeviceTypeValidator
  implements TUpsertDeviceTypeRequestBody {}

export class UpdateDeviceTypeValidator
  extends UpdateValidator
  implements TUpdateDeviceTypeRequestBody {}
