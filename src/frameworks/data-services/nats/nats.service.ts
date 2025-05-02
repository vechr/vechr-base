import { connect, ConnectionOptions, NatsConnection, Subscription } from 'nats';
import { KV, KvOptions, SubscriptionOptions } from 'nats';
import {
  Injectable,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { log, sleep } from '@/frameworks/shared';
import baseConfig from '@/config/base.config';

@Injectable()
export class NatsService
  implements IBaseNatsClient, OnApplicationShutdown, OnModuleInit
{
  public nats: NatsConnection;
  public subscriber: Subscription;
  public kv: KV;

  private brokerConfig: ConnectionOptions = {
    servers: baseConfig.nats?.url,
    maxReconnectAttempts: 10,
    tls: {
      caFile: baseConfig.nats?.ca,
      keyFile: baseConfig.nats?.key,
      certFile: baseConfig.nats?.cert,
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

  /**
   * The `connect` function attempts to establish a connection to a NATS server using the provided
   * connection options, handling errors and retrying if necessary.
   * @param {ConnectionOptions} broker - The `broker` parameter in the `connect` function likely
   * represents the connection options for a NATS (or similar messaging system) client. This could
   * include details such as the servers to connect to, authentication credentials, and other
   * configuration settings required to establish a connection with the messaging broker.
   */
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

  /**
   * The function disconnects from a NATS server using the provided connection options.
   * @param {ConnectionOptions} broker - The `broker` parameter in the `disconnect` function is of type
   * `ConnectionOptions`. It likely contains information related to the connection options for a
   * messaging broker, such as server addresses, authentication details, and other configuration
   * settings needed to establish a connection.
   */
  async disconnect(broker: ConnectionOptions) {
    try {
      await this.nats.close();
    } catch (err) {
      log.error(`error connecting to ${JSON.stringify(broker.servers)}` + err);
    }
  }

  /**
   * The function `subscribe` in TypeScript subscribes to a subject using NATS and handles subscription
   * events.
   * @param {string} subject - The `subject` parameter in the `subscribe` function is a string that
   * represents the topic or channel to which the subscription is being made. It is the identifier for
   * the messages that the subscriber will receive.
   * @param onSubscribe - The `onSubscribe` parameter is a function that takes a `Subscription` object
   * as an argument and returns a `Promise<void>`. This function is called after successfully
   * subscribing to a subject, allowing you to perform any necessary actions or logic with the
   * subscription object.
   * @param {SubscriptionOptions} [subscriberConfig] - The `subscriberConfig` parameter in the
   * `subscribe` function is an optional parameter that allows you to specify additional options for
   * the subscription. These options can include settings such as the maximum number of messages to
   * receive, the timeout for receiving messages, or any other configuration specific to the
   * subscription. It is typically
   */
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

  /**
   * The `createBucket` function in TypeScript asynchronously creates a key-value bucket using NATS
   * Jetstream.
   * @param {string} nameBucket - The `nameBucket` parameter is a string that represents the name of
   * the bucket you want to create.
   * @param [opts] - The `opts` parameter in the `createBucket` function is an optional parameter of
   * type `Partial<KvOptions>`. This means that it is an object that can contain a subset of properties
   * defined in the `KvOptions` interface. It allows you to pass additional configuration options for
   * creating the
   */
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
