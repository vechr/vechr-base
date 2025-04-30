import { TopicEvent } from '@/modules/topic-events/domain/entities/topic-event.entity';
import { Widget } from '@/modules/widgets/domain/entities/widget.entity';
import { $Enums } from '@prisma/client';
import { Exclude } from 'class-transformer';
import { Topic } from './topic.entity';

export class ListTopicSerializer implements Topic {
  @Exclude()
  widgets: Widget[];
  @Exclude()
  topicEvents: TopicEvent[];

  deviceId: string;
  widgetType: $Enums.WidgetType;
  name: string;
  description: string | null;
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export class CreateTopicSerializer implements Topic {
  @Exclude()
  widgets: Widget[];
  @Exclude()
  topicEvents: TopicEvent[];

  deviceId: string;
  widgetType: $Enums.WidgetType;
  name: string;
  description: string | null;
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
export class UpsertTopicSerializer extends CreateTopicSerializer {}
export class UpdateTopicSerializer extends CreateTopicSerializer {}
export class DeleteTopicSerializer extends CreateTopicSerializer {}
export class GetTopicSerializer extends CreateTopicSerializer {}
