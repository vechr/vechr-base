import { ModuleMetadata } from '@nestjs/common';
import { VechrBaseConfig } from './config.interface';

export interface VechrBaseModuleOptions
  extends Pick<ModuleMetadata, 'imports'> {
  config?: Partial<VechrBaseConfig>;
}

export class VechrBaseModuleConfig {
  private static options: VechrBaseModuleOptions = {};

  static setOptions(options: VechrBaseModuleOptions) {
    this.options = options;
  }

  static getOptions(): VechrBaseModuleOptions {
    return this.options;
  }

  static getConfig(): Partial<VechrBaseConfig> {
    return this.options.config || {};
  }
}
