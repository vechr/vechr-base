import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsJSON,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Widget, Prisma, $Enums } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  TCreateWidgetRequestBody,
  TListWidgetRequestQuery,
  TUpdateWidgetRequestBody,
  TUpsertWidgetRequestBody,
} from './widget.entity';
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
export class ListWidgetQueryField
  extends ListQueryField
  implements Prisma.WidgetWhereInput {}

// Create filters class for Cursor Type
export class ListCursorWidgetQueryValidator extends BaseCursorQueryValidator<Widget> {
  @ValidateNested()
  @IsOptional()
  @IsObject()
  @Type(() => ListWidgetQueryField)
  @ApiPropertyOptional({ type: ListWidgetQueryField })
  field?: ListWidgetQueryField;
}

// Create filters class for Pagination Type
export class ListPaginationWidgetQueryValidator extends BasePaginationQueryValidator<Widget> {
  @ValidateNested()
  @IsOptional()
  @IsObject()
  @Type(() => ListWidgetQueryField)
  @ApiPropertyOptional({ type: ListWidgetQueryField })
  field?: ListWidgetQueryField;
}

// implement filter class for Cursor Type
export class FilterCursorWidgetQueryValidator
  implements TListWidgetRequestQuery<IListCursorRequest>
{
  @ValidateNested()
  @IsOptional()
  @IsObject()
  @Type(() => ListCursorWidgetQueryValidator)
  filters: ListCursorWidgetQueryValidator;
}

// implement filter class for Pagination Type
export class FilterPaginationWidgetQueryValidator
  implements TListWidgetRequestQuery<IListPaginationRequest>
{
  @ValidateNested()
  @IsOptional()
  @IsObject()
  @Type(() => ListPaginationWidgetQueryValidator)
  filters: ListPaginationWidgetQueryValidator;
}

export class CreateWidgetValidator
  extends CreateValidator
  implements TCreateWidgetRequestBody
{
  @ApiProperty({
    example: '45019372-0879-4f4b-a644-7aafbab23286',
    description: 'Attach your Widget to Dashboard in Here!',
  })
  @IsString()
  @IsNotEmpty()
  dashboardId: string;

  @ApiProperty({
    example: {
      content: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
      h: 6,
      id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
      w: 3,
      x: 12,
      y: 5,
    },
    description: 'Insert your Node Widget in Here!',
  })
  @IsJSON()
  @IsNotEmpty()
  node: string;

  @ApiProperty({
    example: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
    description: 'Insert your Node Id of your Widget in Here!',
  })
  @IsString()
  @IsNotEmpty()
  nodeId: string;

  @ApiProperty({
    example: {
      labels: ['Red', 'Blue', 'Yellow'],
      datasets: [
        {
          label: 'Data Example',
          data: [300, 50, 100],
          backgroundColor: [
            'rgb(255, 99, 132)',
            'rgb(54, 162, 235)',
            'rgb(255, 205, 86)',
          ],
          hoverOffset: 4,
        },
      ],
    },
    description: 'Insert your Data Widget in Here!',
  })
  @IsJSON()
  @IsNotEmpty()
  widgetData: string;

  @ApiProperty({
    example: 'DOUGHNUT',
    description:
      'Insert your Type Widget in Here! Can be (BAR, BUBBLE, DOUGHNUT, PIE, GAUGE, LINE, POLAR, RADAR, SCATTER, MAPS)',
  })
  @IsString()
  @IsNotEmpty()
  widgetType: $Enums.WidgetType;

  @ApiProperty({
    example: false,
    description: 'Flag for whether data it will be shifted or not! (optional)',
  })
  @IsBoolean()
  @IsOptional()
  shiftData: boolean | null;

  @ApiProperty({
    example: '19e64612-2b72-4d6f-8e1b-e811edafe7e7',
    description: 'Insert your Topic Widget in Here!',
  })
  @IsString()
  @IsNotEmpty()
  topicId: string;
}

export class DeleteWidgetBatchBodyValidator extends IDsValidator {}

export class UpsertWidgetValidator
  extends CreateWidgetValidator
  implements TUpsertWidgetRequestBody {}

export class UpdateWidgetValidator
  extends UpdateValidator
  implements TUpdateWidgetRequestBody
{
  @ApiProperty({
    example: '45019372-0879-4f4b-a644-7aafbab23286',
    description: 'Attach your Widget to Dashboard in Here!',
  })
  @IsString()
  @IsOptional()
  dashboardId: string;

  @ApiProperty({
    example: {
      content: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
      h: 6,
      id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
      w: 3,
      x: 12,
      y: 5,
    },
    description: 'Insert your Node Widget in Here!',
  })
  @IsJSON()
  @IsOptional()
  node: string;

  @ApiProperty({
    example: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
    description: 'Insert your Node Id of your Widget in Here!',
  })
  @IsString()
  @IsOptional()
  nodeId: string;

  @ApiProperty({
    example: {
      labels: ['Red', 'Blue', 'Yellow'],
      datasets: [
        {
          label: 'Data Example',
          data: [300, 50, 100],
          backgroundColor: [
            'rgb(255, 99, 132)',
            'rgb(54, 162, 235)',
            'rgb(255, 205, 86)',
          ],
          hoverOffset: 4,
        },
      ],
    },
    description: 'Insert your Data Widget in Here!',
  })
  @IsJSON()
  @IsOptional()
  widgetData: string;

  @ApiProperty({
    example: 'DOUGHNUT',
    description:
      'Insert your Type Widget in Here! Can be (BAR, BUBBLE, DOUGHNUT, PIE, GAUGE, LINE, POLAR, RADAR, SCATTER, MAPS)',
  })
  @IsString()
  @IsOptional()
  widgetType: $Enums.WidgetType;

  @ApiProperty({
    example: false,
    description: 'Flag for whether data it will be shifted or not! (optional)',
  })
  @IsBoolean()
  @IsOptional()
  shiftData: boolean | null;

  @ApiProperty({
    example: '19e64612-2b72-4d6f-8e1b-e811edafe7e7',
    description: 'Insert your Topic Widget in Here!',
  })
  @IsString()
  @IsOptional()
  topicId: string;
}
