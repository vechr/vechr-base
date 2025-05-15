import { SetMetadata } from '@nestjs/common';
import { HandlerRegistryService } from '@/modules/messaging/domain/usecases/services/handler-registry.service';
import { log } from '../utils';

export const REGISTERED_CONTROLS = 'registered_controls';

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
    // Store the original constructor
    const originalConstructor = target;

    // Create a new constructor function
    const newConstructor: any = function (...args: any[]) {
      // Logging for debugging
      log.debug(`Creating instance of ${target.name} with RegisterControls`);

      const instance = new originalConstructor(...args);

      // Get the handler registry service from the DI container
      const handlerRegistryService = args.find(
        (arg) => arg instanceof HandlerRegistryService,
      ) as HandlerRegistryService;

      // Ensure we have access to the registry service
      if (!handlerRegistryService) {
        log.warn(
          `HandlerRegistryService not injected in ${target.name}. Controls will not be registered.`,
        );
        return instance;
      }

      log.debug(`Found HandlerRegistryService in ${target.name}`);

      // Get all methods from the class prototype
      const prototype = Object.getPrototypeOf(instance);
      const methodNames = Object.getOwnPropertyNames(prototype).filter(
        (prop) => {
          // Exclude constructor and private methods (starting with _)
          return (
            prop !== 'constructor' &&
            !prop.startsWith('_') &&
            typeof prototype[prop] === 'function'
          );
        },
      );

      log.debug(`Found ${methodNames.length} methods in ${target.name}`);

      // Register each method that has the @Control decorator
      methodNames.forEach((methodName) => {
        const method = prototype[methodName];

        // Important: We need to check metadata on the prototype method
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
        } else {
          // Check if metadata exists on the method descriptor in the class definition
          // This addresses issues with how metadata is stored in some cases
          try {
            const descriptor = Object.getOwnPropertyDescriptor(
              prototype,
              methodName,
            );
            if (descriptor && descriptor.value) {
              const descriptorMetadata = Reflect.getMetadata(
                REGISTERED_CONTROLS,
                descriptor.value,
              );

              if (descriptorMetadata) {
                log.debug(
                  `Registering control from descriptor: ${handlerType}.${methodName} - ${descriptorMetadata.description}`,
                );

                handlerRegistryService.registerControl(
                  handlerType,
                  methodName,
                  descriptorMetadata.description,
                );
              }
            }
          } catch (err: any) {
            log.error(`Error checking descriptor metadata: ${err.message}`);
          }
        }
      });

      // Log registration summary
      const registeredControls =
        handlerRegistryService.getControlsForHandler(handlerType);
      log.info(
        `Registered ${registeredControls.length} controls for handler ${handlerType}`,
      );

      return instance;
    };

    // Copy prototype so instanceof operator still works
    newConstructor.prototype = originalConstructor.prototype;

    // Copy metadata from original constructor to new constructor
    // This ensures that NestJS DI system still works properly
    Reflect.getMetadataKeys(originalConstructor).forEach((key) => {
      const value = Reflect.getMetadata(key, originalConstructor);
      Reflect.defineMetadata(key, value, newConstructor);
    });

    // Return the new constructor
    return newConstructor;
  };
}
