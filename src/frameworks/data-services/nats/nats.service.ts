import { connect, ConnectionOptions, NatsConnection, Subscription } from 'nats';
import { KV, KvOptions, SubscriptionOptions } from 'nats';
import {
  Injectable,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { VechrBaseModuleConfig } from '@/config/module.config';
import { log, sleep } from '@/frameworks/shared';

@Injectable()
export class NatsService
  implements IBaseNatsClient, OnApplicationShutdown, OnModuleInit
{
  public nats: NatsConnection;
  public subscriber: Subscription;
  public kv: KV;

  private readonly config = VechrBaseModuleConfig.getConfig();

  private brokerConfig: ConnectionOptions = {
    servers: this.config.nats?.url,
    maxReconnectAttempts: 10,
    tls: {
      caFile: this.config.nats?.ca,
      keyFile: this.config.nats?.key,
      certFile: this.config.nats?.cert,
    },
  };

  private bucketConfig: Partial<KvOptions> = { history: 5 };

  async onModuleInit() {
    await this.connect(this.brokerConfig);
    await this.createBucket('vechr_topics', this.bucketConfig);
  }

  async onApplicationShutdown() {
    await this.disconnect(this.brokerConfig);
  }

  async connect(broker: ConnectionOptions) {
    try {
      await connect(broker).then((nats) => {
        this.nats = nats;
        log.info(`Nats.js Subscriber Connected to ${broker.servers}!`);
      });
    } catch (error) {
      log.error('Failed to connect to NATS.', error);
      await sleep(5000);
      await this.connect(broker);
    }
  }

  async disconnect(broker: ConnectionOptions) {
    try {
      await this.nats.close();
    } catch (err) {
      log.error(`error connecting to ${JSON.stringify(broker.servers)}` + err);
    }
  }

  subscribe(
    subject: string,
    onSubscribe: (sub: Subscription) => Promise<void>,
    subscriberConfig?: SubscriptionOptions,
  ) {
    this.subscriber = this.nats.subscribe(subject, subscriberConfig);
    onSubscribe(this.subscriber);
    log.info(`Success subscribe to: ${subject}!`);

    this.subscriber.closed
      .then(() => {
        log.info('subscription closed');
      })
      .catch((err) => {
        log.error(`subscription closed with an error ${err.message}`);
      });
  }

  async createBucket(
    nameBucket: string,
    opts?: Partial<KvOptions>,
  ): Promise<void> {
    try {
      const js = this.nats.jetstream();
      await js.views.kv(nameBucket, opts).then((kv) => {
        this.kv = kv;
        log.info(`Success create bucket kv: ${nameBucket}!`);
      });
    } catch (error) {
      log.error(`NATS ${JSON.stringify(error)}`);
    }
  }
}

export class IBaseNatsClient {
  connect: (broker: ConnectionOptions) => Promise<void>;
  disconnect: (lbroker: ConnectionOptions) => Promise<void>;
  createBucket: (
    nameBucket: string,
    opts?: Partial<KvOptions>,
  ) => Promise<void>;
}
