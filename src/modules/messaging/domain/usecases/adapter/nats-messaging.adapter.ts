import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { log, publish, requestReply } from '@/frameworks';
import { IMessagingAdapter } from '../../entities/messaging-adapter.interface';
import baseConfig from '@/config/base.config';

@Injectable()
export class NatsMessagingAdapter implements IMessagingAdapter {
  constructor(
    @Inject(baseConfig.nats.service) private readonly _clientNats: ClientProxy,
  ) {}

  async publish(subject: string, data: any): Promise<any> {
    try {
      await publish(this._clientNats, subject, data);
    } catch (err) {
      log.error(`Error publishing to ${subject}:`, { error: err });
      throw err;
    }
  }

  async request(subject: string, data: any): Promise<any> {
    try {
      const response = await requestReply(this._clientNats, subject, data);
      return response;
    } catch (err) {
      log.error(`Error requesting on ${subject}:`, { error: err });
      throw err;
    }
  }
}
