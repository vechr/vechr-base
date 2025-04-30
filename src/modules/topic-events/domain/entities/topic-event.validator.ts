import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsJSON,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { TopicEvent, Prisma } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  TCreateTopicEventRequestBody,
  TListTopicEventRequestQuery,
  TUpdateTopicEventRequestBody,
  TUpsertTopicEventRequestBody,
} from './topic-event.entity';
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
export class ListTopicEventQueryField
  extends ListQueryField
  implements Prisma.TopicEventWhereInput {}

// Create filters class for Cursor Type
export class ListCursorTopicEventQueryValidator extends BaseCursorQueryValidator<TopicEvent> {
  @ValidateNested()
  @IsOptional()
  @IsObject()
  @Type(() => ListTopicEventQueryField)
  @ApiPropertyOptional({ type: ListTopicEventQueryField })
  field?: ListTopicEventQueryField;
}

// Create filters class for Pagination Type
export class ListPaginationTopicEventQueryValidator extends BasePaginationQueryValidator<TopicEvent> {
  @ValidateNested()
  @IsOptional()
  @IsObject()
  @Type(() => ListTopicEventQueryField)
  @ApiPropertyOptional({ type: ListTopicEventQueryField })
  field?: ListTopicEventQueryField;
}

// implement filter class for Cursor Type
export class FilterCursorTopicEventQueryValidator
  implements TListTopicEventRequestQuery<IListCursorRequest>
{
  @ValidateNested()
  @IsOptional()
  @IsObject()
  @Type(() => ListCursorTopicEventQueryValidator)
  filters: ListCursorTopicEventQueryValidator;
}

// implement filter class for Pagination Type
export class FilterPaginationTopicEventQueryValidator
  implements TListTopicEventRequestQuery<IListPaginationRequest>
{
  @ValidateNested()
  @IsOptional()
  @IsObject()
  @Type(() => ListPaginationTopicEventQueryValidator)
  filters: ListPaginationTopicEventQueryValidator;
}

export class CreateTopicEventValidator
  extends CreateValidator
  implements TCreateTopicEventRequestBody
{
  @ApiProperty({
    example: ['d8beca16-5296-458a-bc8a-609d217fed08'],
    description: 'You can attach topicEvent into this notification email here!',
  })
  @IsArray()
  notificationEmails: string[];

  @ApiProperty({
    example: '45019372-0879-4f4b-a644-7aafbab23286',
    description: 'Attach your Topic Type to Topic Event in Here!',
  })
  @IsString()
  @IsNotEmpty()
  topicId: string;

  @ApiProperty({
    example: { key: 100 },
    description: 'Insert your Expression in Here!',
  })
  @IsJSON()
  @IsOptional()
  eventExpression: string | null;

  @ApiProperty({
    example: 'Hello this is body email',
    description:
      'Email text body that will be send when expression is triggered',
  })
  @IsString()
  @IsOptional()
  bodyEmail: string;

  @ApiProperty({
    example: '<h1>Hello this is body email</h1>',
    description:
      'Email html body that will be send when expression is triggered',
  })
  @IsString()
  @IsOptional()
  htmlBodyEmail: string;
}

export class DeleteTopicEventBatchBodyValidator extends IDsValidator {}

export class UpsertTopicEventValidator
  extends CreateTopicEventValidator
  implements TUpsertTopicEventRequestBody {}

export class UpdateTopicEventValidator
  extends UpdateValidator
  implements TUpdateTopicEventRequestBody
{
  @ApiProperty({
    example: '45019372-0879-4f4b-a644-7aafbab23286',
    description: 'Attach your Topic Type to Topic Event in Here!',
  })
  @IsString()
  @IsOptional()
  topicId: string;

  @ApiProperty({
    example: { key: 100 },
    description: 'Insert your Expression in Here!',
  })
  @IsJSON()
  @IsOptional()
  eventExpression: string | null;

  @ApiProperty({
    example: 'Hello this is body email',
    description:
      'Email text body that will be send when expression is triggered',
  })
  @IsString()
  @IsOptional()
  bodyEmail: string;

  @ApiProperty({
    example: '<h1>Hello this is body email</h1>',
    description:
      'Email html body that will be send when expression is triggered',
  })
  @IsString()
  @IsOptional()
  htmlBodyEmail: string;
}
