import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsObject, IsOptional, ValidateNested } from 'class-validator';
import { Dashboard, Prisma } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  TCreateDashboardRequestBody,
  TListDashboardRequestQuery,
  TUpdateDashboardRequestBody,
  TUpsertDashboardRequestBody,
} from './dashboard.entity';
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
export class ListDashboardQueryField
  extends ListQueryField
  implements Prisma.DashboardWhereInput {}

// Create filters class for Cursor Type
export class ListCursorDashboardQueryValidator extends BaseCursorQueryValidator<Dashboard> {
  @ValidateNested()
  @IsOptional()
  @IsObject()
  @Type(() => ListDashboardQueryField)
  @ApiPropertyOptional({ type: ListDashboardQueryField })
  field?: ListDashboardQueryField;
}

// Create filters class for Pagination Type
export class ListPaginationDashboardQueryValidator extends BasePaginationQueryValidator<Dashboard> {
  @ValidateNested()
  @IsOptional()
  @IsObject()
  @Type(() => ListDashboardQueryField)
  @ApiPropertyOptional({ type: ListDashboardQueryField })
  field?: ListDashboardQueryField;
}

// implement filter class for Cursor Type
export class FilterCursorDashboardQueryValidator
  implements TListDashboardRequestQuery<IListCursorRequest>
{
  @ValidateNested()
  @IsOptional()
  @IsObject()
  @Type(() => ListCursorDashboardQueryValidator)
  filters: ListCursorDashboardQueryValidator;
}

// implement filter class for Pagination Type
export class FilterPaginationDashboardQueryValidator
  implements TListDashboardRequestQuery<IListPaginationRequest>
{
  @ValidateNested()
  @IsOptional()
  @IsObject()
  @Type(() => ListPaginationDashboardQueryValidator)
  filters: ListPaginationDashboardQueryValidator;
}

export class CreateDashboardValidator
  extends CreateValidator
  implements TCreateDashboardRequestBody
{
  @ApiProperty({
    example: ['d8beca16-5296-458a-bc8a-609d217fed08'],
    description: 'You can attach device into this dashboard!',
  })
  @IsArray()
  devices: string[];
}

export class DeleteDashboardBatchBodyValidator extends IDsValidator {}

export class UpsertDashboardValidator
  extends CreateDashboardValidator
  implements TUpsertDashboardRequestBody {}

export class UpdateDashboardValidator
  extends UpdateValidator
  implements TUpdateDashboardRequestBody {}
