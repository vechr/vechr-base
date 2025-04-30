import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Topic, Prisma, $Enums } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  TCreateTopicRequestBody,
  TListTopicRequestQuery,
  TUpdateTopicRequestBody,
  TUpsertTopicRequestBody,
} from './topic.entity';
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
export class ListTopicQueryField
  extends ListQueryField
  implements Prisma.TopicWhereInput {}

// Create filters class for Cursor Type
export class ListCursorTopicQueryValidator extends BaseCursorQueryValidator<Topic> {
  @ValidateNested()
  @IsOptional()
  @IsObject()
  @Type(() => ListTopicQueryField)
  @ApiPropertyOptional({ type: ListTopicQueryField })
  field?: ListTopicQueryField;
}

// Create filters class for Pagination Type
export class ListPaginationTopicQueryValidator extends BasePaginationQueryValidator<Topic> {
  @ValidateNested()
  @IsOptional()
  @IsObject()
  @Type(() => ListTopicQueryField)
  @ApiPropertyOptional({ type: ListTopicQueryField })
  field?: ListTopicQueryField;
}

// implement filter class for Cursor Type
export class FilterCursorTopicQueryValidator
  implements TListTopicRequestQuery<IListCursorRequest>
{
  @ValidateNested()
  @IsOptional()
  @IsObject()
  @Type(() => ListCursorTopicQueryValidator)
  filters: ListCursorTopicQueryValidator;
}

// implement filter class for Pagination Type
export class FilterPaginationTopicQueryValidator
  implements TListTopicRequestQuery<IListPaginationRequest>
{
  @ValidateNested()
  @IsOptional()
  @IsObject()
  @Type(() => ListPaginationTopicQueryValidator)
  filters: ListPaginationTopicQueryValidator;
}

export class CreateTopicValidator
  extends CreateValidator
  implements TCreateTopicRequestBody
{
  @ApiProperty({
    example: 'DOUGHNUT',
    description:
      'Insert your Type Widget in Here! Can be (BAR, BUBBLE, DOUGHNUT, PIE, GAUGE, LINE, POLAR, RADAR, SCATTER, MAPS)',
  })
  @IsString()
  @IsOptional()
  widgetType: $Enums.WidgetType;

  @ApiProperty({
    example: '45019372-0879-4f4b-a644-7aafbab23286',
    description: 'Attach your Device to Topic in Here!',
  })
  @IsString()
  @IsNotEmpty()
  deviceId: string;
}

export class DeleteTopicBatchBodyValidator extends IDsValidator {}

export class UpsertTopicValidator
  extends CreateTopicValidator
  implements TUpsertTopicRequestBody {}

export class UpdateTopicValidator
  extends UpdateValidator
  implements TUpdateTopicRequestBody
{
  @ApiProperty({
    example: 'DOUGHNUT',
    description:
      'Insert your Type Widget in Here! Can be (BAR, BUBBLE, DOUGHNUT, PIE, GAUGE, LINE, POLAR, RADAR, SCATTER, MAPS)',
  })
  @IsString()
  @IsOptional()
  widgetType: $Enums.WidgetType;

  @ApiProperty({
    example: '45019372-0879-4f4b-a644-7aafbab23286',
    description: 'Attach your Device to Topic in Here!',
  })
  @IsString()
  @IsOptional()
  deviceId: string;
}

export class DBLoggerRequestValidator {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '8ae24fe4-f1e9-4a6d-8768-df10d8240a68',
    description: 'Input your dashboardId in here',
  })
  dashboardId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '1c789647-440d-4ff0-8584-0b85ae566c1c',
    description: 'Input your deviceId in here',
  })
  deviceId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '0b17a38d-4d03-4c8c-9ef4-d36b8601b571',
    description: 'Input your topicId in here',
  })
  topicId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '/topicA',
    description: 'Input your topic name in here',
  })
  topic: string;
}
