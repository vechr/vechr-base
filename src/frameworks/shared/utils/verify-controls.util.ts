import { INestApplication } from '@nestjs/common';
import { HandlerRegistryService } from '@/modules/messaging/domain/usecases/services/handler-registry.service';
import { log } from './log.util';

/**
 * Verify that controls are properly registered in the HandlerRegistryService
 *
 * This is a helper function to debug issues with control registration.
 * It dumps the current state of the HandlerRegistryService to the logs.
 *
 * @param app The NestJS application instance
 */
export function verifyControlRegistration(app: INestApplication): void {
  try {
    log.info('=== VERIFYING CONTROL REGISTRATION ===');

    // Get the HandlerRegistryService from the NestJS container
    const handlerRegistryService = app.get(HandlerRegistryService);

    if (!handlerRegistryService) {
      log.error('HandlerRegistryService not found in application container');
      return;
    }

    log.info('HandlerRegistryService found in application container');

    // Get all registered handlers and controls
    const allControls = handlerRegistryService.getAllControls();
    const handlerTypes = handlerRegistryService.getHandlerTypes();
    const totalCount = handlerRegistryService.getTotalControlCount();

    log.info(`Total handler types: ${handlerTypes.length}`);
    log.info(`Total controls: ${totalCount}`);
    log.info(`All controls: ${JSON.stringify(allControls)}`);

    if (handlerTypes.length === 0) {
      log.warn(
        'No handler types found - controls may not be registering properly',
      );

      // Access private _controls property directly to see if it's actually empty
      const controlsMap = (handlerRegistryService as any).controls;
      if (controlsMap && controlsMap.size > 0) {
        log.warn(
          'Controls map has data but getAllControls returned empty - possible service scope issue',
        );
      }
    } else {
      // Log details of each handler type
      handlerTypes.forEach((handlerType) => {
        const controls =
          handlerRegistryService.getControlsForHandler(handlerType);
        log.info(`Handler: ${handlerType} (${controls.length} controls)`);

        // Log individual controls
        controls.forEach((control) => {
          log.info(`  - ${control.name}: ${control.description}`);
        });
      });
    }

    // Use the built-in dump method
    handlerRegistryService.dumpControls();

    log.info('=== CONTROL VERIFICATION COMPLETE ===');
  } catch (error: any) {
    log.error(`Error verifying control registration: ${error.message}`);
  }
}
