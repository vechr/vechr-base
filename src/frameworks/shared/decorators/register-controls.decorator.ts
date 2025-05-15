import { HandlerRegistryService } from '@/modules/messaging/domain/usecases/services/handler-registry.service';
import { SetMetadata } from '@nestjs/common';
import { log } from '../utils';

export const REGISTERED_CONTROLS = 'registered_controls';
export const HANDLER_TYPE_KEY = 'handler_type_key';

export interface ControlMetadata {
  description: string;
}

/**
 * Decorator for registering a method as a control
 *
 * @param description Description of what the control does
 */
export const Control = (description: string) =>
  SetMetadata<string, ControlMetadata>(REGISTERED_CONTROLS, { description });

/**
 * Decorator for registering a handler class with all its control methods.
 *
 * This decorator automatically detects the HandlerRegistryService from the
 * dependency injection container, so you don't need to manually inject it
 * in your handler constructor.
 *
 * Usage:
 * ```typescript
 * @Injectable()
 * @RegisterControls('MyHandlerType')
 * export class MyHandler {
 *   constructor() {
 *     // No need to inject HandlerRegistryService
 *   }
 *
 *   @Control('Does something useful')
 *   async myMethod() {
 *     // Implementation
 *   }
 * }
 * ```
 *
 * @param handlerType The type of handler (SystemControl, Command, etc.)
 */
export function RegisterControls(handlerType: string) {
  return function (target: any) {
    // Store the handler type on the class itself for later use
    Reflect.defineMetadata(HANDLER_TYPE_KEY, handlerType, target);

    log.debug(`Registered handler type ${handlerType} on class ${target.name}`);

    // Find all methods with Control decorator in the class prototype
    const prototype = target.prototype;
    const methodNames = Object.getOwnPropertyNames(prototype).filter((prop) => {
      return (
        prop !== 'constructor' &&
        !prop.startsWith('_') &&
        typeof prototype[prop] === 'function'
      );
    });

    log.debug(`Found ${methodNames.length} methods in class ${target.name}`);

    // Original constructor
    const originalInit = target.prototype.onModuleInit;

    // Add onModuleInit lifecycle hook to register controls when module initializes
    target.prototype.onModuleInit = async function () {
      // Call original onModuleInit if it exists
      if (originalInit) {
        await originalInit.call(this);
      }

      try {
        // Find the HandlerRegistryService
        const handlerRegistryService = this.handlerRegistry;

        if (!handlerRegistryService) {
          log.warn(
            `HandlerRegistryService not injected in ${target.name} (property 'handlerRegistry' not found).`,
          );
          return;
        }

        if (!(handlerRegistryService instanceof HandlerRegistryService)) {
          log.warn(
            `Property 'handlerRegistry' in ${target.name} is not an instance of HandlerRegistryService.`,
          );
          return;
        }

        log.debug(`Found HandlerRegistryService in ${target.name}`);

        // Register each method that has the @Control decorator
        for (const methodName of methodNames) {
          try {
            const method = prototype[methodName];
            const metadata = Reflect.getMetadata(REGISTERED_CONTROLS, method);

            if (metadata) {
              log.debug(
                `Registering control: ${handlerType}.${methodName} - ${metadata.description}`,
              );

              handlerRegistryService.registerControl(
                handlerType,
                methodName,
                metadata.description,
              );
            }
          } catch (err: any) {
            log.error(
              `Error registering control ${methodName}: ${err.message}`,
            );
          }
        }

        const registeredControls =
          handlerRegistryService.getControlsForHandler(handlerType);
        log.info(
          `Registered ${registeredControls.length} controls for handler ${handlerType}`,
        );
      } catch (err: any) {
        log.error(`Error in onModuleInit for ${target.name}: ${err.message}`);
      }
    };

    return target;
  };
}
