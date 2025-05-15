import { log } from './log.util';
import { HandlerRegistryService } from '@/modules/messaging/domain/usecases/services/handler-registry.service';

/**
 * Debug helper to check if multiple instances of HandlerRegistryService exist
 *
 * Call this function at various points in your application to verify
 * that the HandlerRegistryService singleton pattern is working correctly.
 */
export function debugHandlerRegistry(instanceName: string): void {
  // Create a test instance - this should return the global instance
  const registryService = new HandlerRegistryService();

  log.info(`=== HANDLER REGISTRY DEBUG [${instanceName}] ===`);
  log.info(`HandlerRegistryService instance check:`);
  log.info(`- Has controls: ${registryService.controls.size}`);
  log.info(
    `- Handler types: ${registryService.getHandlerTypes().join(', ') || 'none'}`,
  );
  log.info(`- Total controls: ${registryService.getTotalControlCount()}`);

  // Debug specific handlers
  registryService.getHandlerTypes().forEach((handlerType) => {
    const controls = registryService.getControlsForHandler(handlerType);
    log.info(`- Handler [${handlerType}]: ${controls.length} controls`);
    controls.forEach((control) => {
      log.info(`  * ${control.name}: ${control.description}`);
    });
  });

  log.info(`=== END HANDLER REGISTRY DEBUG ===`);
}

/**
 * Register a test control to verify the HandlerRegistryService is working
 */
export function registerTestControl(key: string = 'test'): void {
  const registry = new HandlerRegistryService();
  registry.registerControl(
    'DebugHandler',
    `testControl_${key}`,
    `Test control for debugging (${key})`,
  );
  log.info(`Registered test control: DebugHandler.testControl_${key}`);

  // Verify it was registered
  const controls = registry.getControlsForHandler('DebugHandler');
  log.info(`DebugHandler now has ${controls.length} controls`);
}
