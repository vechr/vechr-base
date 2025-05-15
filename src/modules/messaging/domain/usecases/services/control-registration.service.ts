import { Injectable, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { HandlerRegistryService } from './handler-registry.service';
import { registerControlsFromMetadata } from '../../../../../frameworks/shared/decorators/register-control.decorator';
import { log } from '@/frameworks';

/**
 * Service to handle automatic registration of controls from decorated methods
 * This service runs during module initialization to scan all controllers and handlers
 * that use the @RegisterControl decorator
 */
@Injectable()
export class ControlRegistrationService implements OnModuleInit {
  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly handlerRegistry: HandlerRegistryService,
  ) {}

  /**
   * Automatically register all controls when the module initializes
   */
  async onModuleInit() {
    try {
      log.info('Initializing control registration service');

      // Auto-discover and register controllers with the SystemMonitorController suffix
      this.registerControllersWithSuffix('Controller');

      // Auto-discover and register handlers with the Handler suffix
      this.registerControllersWithSuffix('Handler');

      log.info(
        `Control registration complete. Total controls: ${this.handlerRegistry.getTotalControlCount()}`,
      );
    } catch (error) {
      log.error('Error during control registration', { error });
    }
  }

  /**
   * Register all controllers with a specific suffix
   */
  private registerControllersWithSuffix(suffix: string) {
    try {
      // Get all providers from the module
      const providers = (this.moduleRef as any)._providers;

      if (!providers || !providers.size) {
        log.warn('No providers found in module');
        return;
      }

      // Find all controllers by checking class names
      for (const [key, value] of providers.entries()) {
        if (
          key &&
          typeof key === 'string' &&
          key.endsWith(suffix) &&
          value &&
          value.instance
        ) {
          try {
            log.debug(`Registering controls for: ${key}`);
            registerControlsFromMetadata(value.instance, this.handlerRegistry);
          } catch (err) {
            log.error(`Failed to register controls for: ${key}`, {
              error: err,
            });
          }
        }
      }
    } catch (error) {
      log.error('Error registering controllers', { error });
    }
  }
}
