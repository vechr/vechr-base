import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { OpenTelemetryModule } from 'nestjs-otel';
import { TerminusModule } from '@nestjs/terminus';
import { WinstonModule } from 'nest-winston';
import { winstonModuleOptions } from '@utils/log.util';
import HealthModule from '@health/health.module';
import { CacheModule } from '@nestjs/cache-manager';
import appConfig from './config/app.config';
import { InstrumentMiddleware } from './core/base/frameworks/shared/middlewares/instrument.middleware';
import { CoreModule } from './core/modules/core.module';
import AuthModule from './core/base/frameworks/auth/auth.module';
import { RegistrationModule } from './modules/registration.module';
import { createKeyv, Keyv } from '@keyv/redis';
import { CacheableMemory } from 'cacheable';

const OpenTelemetryModuleConfig = OpenTelemetryModule.forRoot({
  metrics: {
    hostMetrics: true,
    apiMetrics: {
      enable: true,
      ignoreRoutes: ['/favicon.ico', '/health', '/'],
    },
  },
});

const WinstonLoggerModule = WinstonModule.forRootAsync({
  useFactory: () => winstonModuleOptions,
});

@Module({
  imports: [
    // framework
    TerminusModule,
    OpenTelemetryModuleConfig,
    WinstonLoggerModule,
    HealthModule,
    AuthModule,
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        return {
          stores: [
            new Keyv({
              store: new CacheableMemory({ ttl: appConfig.REDIS_TTL }),
            }),
            createKeyv(appConfig.REDIS_URL),
          ],
        };
      },
    }),

    CoreModule,
    RegistrationModule,
  ],
})
export default class HttpModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(InstrumentMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
