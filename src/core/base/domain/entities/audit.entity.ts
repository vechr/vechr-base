import { $Enums, Prisma, Audit as TAudit } from '@prisma/client';
import {
  BaseCursorQueryValidator,
  BasePaginationQueryValidator,
  IListCursorRequest,
  IListPaginationRequest,
  IListRequestQuery,
} from './query.entity';
import { Expose, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { StringFilterQuery } from './prisma.entity';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class Audit implements TAudit {
  id: string;
  auditable: string;
  auditableId: string;
  changeCount: number;
  previous: Prisma.JsonValue;
  incoming: Prisma.JsonValue;
  action: $Enums.AuditAction;
  username: string | null;
  userId: string;
  createdAt: Date;
}

export class AuditList {
  id: string;
  changeCount: number;
  action: $Enums.AuditAction;
  username: string | null;
  createdAt: Date;
}

export class ListAuditSerializer extends AuditList {}

export type TListAuditRequestQuery<P> = IListRequestQuery<
  P,
  Audit,
  Prisma.AuditWhereInput
>;

// For field filter in list whether cursor or pagination
export class ListAuditQueryField implements Prisma.AuditWhereInput {
  @Expose()
  @ValidateNested()
  @IsNotEmpty()
  @Type(() => StringFilterQuery)
  @ApiPropertyOptional({ type: StringFilterQuery })
  auditableId: string;
}

// Create filters class for Cursor Type
export class ListCursorAuditQueryValidator extends BaseCursorQueryValidator<Audit> {
  @ValidateNested()
  @IsOptional()
  @IsNotEmpty()
  @Type(() => ListAuditQueryField)
  @ApiPropertyOptional({ type: ListAuditQueryField })
  field?: ListAuditQueryField;
}

// Create filters class for Pagination Type
export class ListPaginationAuditQueryValidator extends BasePaginationQueryValidator<Audit> {
  @ValidateNested()
  @IsOptional()
  @IsObject()
  @Type(() => ListAuditQueryField)
  @ApiPropertyOptional({ type: ListAuditQueryField })
  field?: ListAuditQueryField;
}

// implement filter class for Cursor Type
export class FilterCursorAuditQueryValidator
  implements TListAuditRequestQuery<IListCursorRequest>
{
  @ValidateNested()
  @IsOptional()
  @IsObject()
  @Type(() => ListCursorAuditQueryValidator)
  filters: ListCursorAuditQueryValidator;
}

// implement filter class for Pagination Type
export class FilterPaginationAuditQueryValidator
  implements TListAuditRequestQuery<IListPaginationRequest>
{
  @ValidateNested()
  @IsOptional()
  @IsObject()
  @Type(() => ListPaginationAuditQueryValidator)
  filters: ListPaginationAuditQueryValidator;
}
