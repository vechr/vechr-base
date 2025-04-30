import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Device, Prisma } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  TCreateDeviceRequestBody,
  TListDeviceRequestQuery,
  TUpdateDeviceRequestBody,
  TUpsertDeviceRequestBody,
} from './device.entity';
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
export class ListDeviceQueryField
  extends ListQueryField
  implements Prisma.DeviceWhereInput {}

// Create filters class for Cursor Type
export class ListCursorDeviceQueryValidator extends BaseCursorQueryValidator<Device> {
  @ValidateNested()
  @IsOptional()
  @IsObject()
  @Type(() => ListDeviceQueryField)
  @ApiPropertyOptional({ type: ListDeviceQueryField })
  field?: ListDeviceQueryField;
}

// Create filters class for Pagination Type
export class ListPaginationDeviceQueryValidator extends BasePaginationQueryValidator<Device> {
  @ValidateNested()
  @IsOptional()
  @IsObject()
  @Type(() => ListDeviceQueryField)
  @ApiPropertyOptional({ type: ListDeviceQueryField })
  field?: ListDeviceQueryField;
}

// implement filter class for Cursor Type
export class FilterCursorDeviceQueryValidator
  implements TListDeviceRequestQuery<IListCursorRequest>
{
  @ValidateNested()
  @IsOptional()
  @IsObject()
  @Type(() => ListCursorDeviceQueryValidator)
  filters: ListCursorDeviceQueryValidator;
}

// implement filter class for Pagination Type
export class FilterPaginationDeviceQueryValidator
  implements TListDeviceRequestQuery<IListPaginationRequest>
{
  @ValidateNested()
  @IsOptional()
  @IsObject()
  @Type(() => ListPaginationDeviceQueryValidator)
  filters: ListPaginationDeviceQueryValidator;
}

export class CreateDeviceValidator
  extends CreateValidator
  implements TCreateDeviceRequestBody
{
  @ApiProperty({
    example: true,
    description: 'Make this true if device still in used!',
  })
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;

  @ApiProperty({
    example: '45019372-0879-4f4b-a644-7aafbab23286',
    description: 'Attach your Device Type to Device in Here!',
  })
  @IsString()
  @IsNotEmpty()
  deviceTypeId: string;
}

export class DeleteDeviceBatchBodyValidator extends IDsValidator {}

export class UpsertDeviceValidator
  extends CreateDeviceValidator
  implements TUpsertDeviceRequestBody {}

export class UpdateDeviceValidator
  extends UpdateValidator
  implements TUpdateDeviceRequestBody
{
  @ApiProperty({
    example: false,
    description: 'Make this true if device still in used!',
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    example: '45019372-0879-4f4b-a644-7aafbab23286',
    description: 'Attach your Device Type to Device in Here!',
  })
  @IsString()
  @IsOptional()
  deviceTypeId: string;
}
