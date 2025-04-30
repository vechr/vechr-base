import { Injectable } from '@nestjs/common';
import { VechrBaseModuleConfig } from '@vechr/vechr-base';

@Injectable()
export class AppService {
  private readonly config = VechrBaseModuleConfig.getConfig();

  getAppInfo() {
    return {
      name: this.config.app?.name,
      port: this.config.app?.port,
      features: {
        notifications: (this.config as any).features?.enableNotifications,
        maxRetries: (this.config as any).features?.maxRetries,
      },
    };
  }

  getDatabaseConfig() {
    return {
      url: (this.config as any).database?.url,
      schema: (this.config as any).database?.schema,
    };
  }

  getCacheConfig() {
    return {
      redis: this.config.cache?.redis,
    };
  }

  getLoggingConfig() {
    return {
      loki: this.config.logging?.loki,
    };
  }
} 