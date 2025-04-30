import { Controller, UseFilters } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { OtelInstanceCounter, OtelMethodCounter } from 'nestjs-otel';
import { ExceptionFilter } from '@filters/rpc-exception.filter';
import { TopicUseCaseNATS } from '../domain/usecase/topic-nats.usecase';

@Controller()
@OtelInstanceCounter()
export class TopicControllerNATS {
  constructor(private readonly topicNATS: TopicUseCaseNATS) {}

  @UseFilters(new ExceptionFilter())
  @EventPattern('set.topic.widget.kv')
  @OtelMethodCounter()
  async getTopic(@Payload() { topicId }: { topicId: string }): Promise<void> {
    await this.topicNATS.getTopic(topicId);
  }
}
