import { Injectable } from '@nestjs/common';
import { ConfigRegistry } from './config-registry.service';

@Injectable()
export class ConfigCollectorService {
  private extendedConfigs: Record<string, any> = {};
  private sensitiveKeys = ['secret', 'password', 'key', 'cert', 'ca'];

  constructor() {}

  /**
   * Register a configuration
   */
  registerConfig(name: string, config: any): void {
    this.extendedConfigs[name] = config;
    this.collectConfig(name, config);
  }

  /**
   * Check if a key is sensitive
   */
  private isSensitiveKey(key: string): boolean {
    return this.sensitiveKeys.some((sensitiveKey) =>
      key.toLowerCase().includes(sensitiveKey.toLowerCase()),
    );
  }

  /**
   * Mask sensitive value
   */
  private maskValue(value: any): any {
    if (typeof value === 'string') {
      return '******';
    }
    return value;
  }

  /**
   * Collect configuration keys from a specific config object
   */
  private collectConfig(configName: string, config: any): void {
    if (!config) return;

    const processConfig = (obj: any): any => {
      if (!obj) return obj;

      if (typeof obj === 'object') {
        const result = Array.isArray(obj) ? [] : {};

        Object.entries(obj).forEach(([key, value]) => {
          if (typeof value === 'object' && value !== null) {
            result[key] = processConfig(value);
          } else {
            result[key] = this.isSensitiveKey(key)
              ? this.maskValue(value)
              : value;
          }
        });

        return result;
      }

      return obj;
    };

    const processedConfig = processConfig(config);
    ConfigRegistry.addConfigKey(configName, null, processedConfig);
  }

  /**
   * Get all collected configuration keys
   */
  getAllConfigKeys(): Record<string, any> {
    return ConfigRegistry.getAllConfigKeys();
  }

  /**
   * Get configuration keys for a specific category
   */
  getConfigKeysForCategory(category: string): any {
    return ConfigRegistry.getConfigKeysForCategory(category);
  }

  /**
   * Get a configuration by name
   */
  getConfig(name: string): any {
    return this.extendedConfigs[name];
  }
}
