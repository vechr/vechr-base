import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { NotificationEmail, Prisma } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  TCreateNotificationEmailRequestBody,
  TListNotificationEmailRequestQuery,
  TUpdateNotificationEmailRequestBody,
  TUpsertNotificationEmailRequestBody,
} from './notification-email.entity';
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
export class ListNotificationEmailQueryField
  extends ListQueryField
  implements Prisma.NotificationEmailWhereInput {}

// Create filters class for Cursor Type
export class ListCursorNotificationEmailQueryValidator extends BaseCursorQueryValidator<NotificationEmail> {
  @ValidateNested()
  @IsOptional()
  @IsObject()
  @Type(() => ListNotificationEmailQueryField)
  @ApiPropertyOptional({ type: ListNotificationEmailQueryField })
  field?: ListNotificationEmailQueryField;
}

// Create filters class for Pagination Type
export class ListPaginationNotificationEmailQueryValidator extends BasePaginationQueryValidator<NotificationEmail> {
  @ValidateNested()
  @IsOptional()
  @IsObject()
  @Type(() => ListNotificationEmailQueryField)
  @ApiPropertyOptional({ type: ListNotificationEmailQueryField })
  field?: ListNotificationEmailQueryField;
}

// implement filter class for Cursor Type
export class FilterCursorNotificationEmailQueryValidator
  implements TListNotificationEmailRequestQuery<IListCursorRequest>
{
  @ValidateNested()
  @IsOptional()
  @IsObject()
  @Type(() => ListCursorNotificationEmailQueryValidator)
  filters: ListCursorNotificationEmailQueryValidator;
}

// implement filter class for Pagination Type
export class FilterPaginationNotificationEmailQueryValidator
  implements TListNotificationEmailRequestQuery<IListPaginationRequest>
{
  @ValidateNested()
  @IsOptional()
  @IsObject()
  @Type(() => ListPaginationNotificationEmailQueryValidator)
  filters: ListPaginationNotificationEmailQueryValidator;
}

export class CreateNotificationEmailValidator
  extends CreateValidator
  implements TCreateNotificationEmailRequestBody
{
  @ApiProperty({
    example: 'jack@gmail.com',
    description: 'Insert your sender email notification in here!',
  })
  @IsString()
  @IsNotEmpty()
  sender: string;

  @ApiProperty({
    example: 'john@gmail.com',
    description: 'Insert your john email notification in Here!',
  })
  @IsString()
  @IsNotEmpty()
  recipient: string;
}

export class DeleteNotificationEmailBatchBodyValidator extends IDsValidator {}

export class UpsertNotificationEmailValidator
  extends CreateNotificationEmailValidator
  implements TUpsertNotificationEmailRequestBody {}

export class UpdateNotificationEmailValidator
  extends UpdateValidator
  implements TUpdateNotificationEmailRequestBody
{
  @ApiProperty({
    example: 'jack@gmail.com',
    description: 'Insert your sender email notification in Here!',
  })
  @IsString()
  @IsOptional()
  sender: string;

  @ApiProperty({
    example: 'john@gmail.com',
    description: 'Insert your john email notification in Here!',
  })
  @IsString()
  @IsOptional()
  recipient: string;
}
