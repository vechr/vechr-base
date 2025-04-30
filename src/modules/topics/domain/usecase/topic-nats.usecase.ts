import { TopicRepository } from '../../data/topic.repository';
import {
  EErrorCommonCode,
  UnknownException,
} from '@/core/base/frameworks/shared/exceptions/common.exception';
import { Inject, Injectable } from '@nestjs/common';
import PrismaService from '@/core/base/frameworks/data-services/prisma/prisma.service';
import { ClientNats } from '@nestjs/microservices';
import { DBLoggerRequestValidator } from '../entities/topic.validator';
import { QueryCreateEvent } from '../entities/topic.entity';
import { lastValueFrom } from 'rxjs';
import { StringCodec } from 'nats';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import log from '@/core/base/frameworks/shared/utils/log.util';
import { NatsService } from '@/core/base/frameworks/data-services/nats/nats.service';

@Injectable()
export class TopicUseCaseNATS {
  constructor(
    private readonly db: PrismaService,
    private readonly repository: TopicRepository,
    @Inject('NATS_SERVICE') private readonly dbLoggerClient: ClientNats,
    private readonly natsService: NatsService,
  ) {}

  async getDataTopic(dto: DBLoggerRequestValidator) {
    const source = this.dbLoggerClient.send(
      'getData.query',
      new QueryCreateEvent(
        dto.dashboardId,
        dto.deviceId,
        dto.topicId,
        dto.topic,
      ),
    );
    return await lastValueFrom(source);
  }

  async getTopic(topicId: string): Promise<void> {
    try {
      const result = await this.db.$transaction(async (tx) => {
        return await this.repository.getById(topicId, tx, {
          topicEvents: {
            include: {
              notificationEmails: true,
            },
          },
          widgets: true,
        });
      });

      await this.natsService.kv.put(
        result.id,
        StringCodec().encode(JSON.stringify(result)),
      );
    } catch (error: any) {
      if (error instanceof PrismaClientKnownRequestError) {
        log.error(error.message);
        throw new UnknownException({
          code: EErrorCommonCode.INTERNAL_SERVER_ERROR,
          message: `Error unexpected during retrieve a list!`,
          params: { exception: error.message },
        });
      }
      throw error;
    }
  }
}
