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

      // Register each method that has the @Control decorator
      methodNames.forEach((methodName) => {
        const method = prototype[methodName];
        const metadata = Reflect.getMetadata(REGISTERED_CONTROLS, method);

        if (metadata) {
          handlerRegistryService.registerControl(
            handlerType,
            methodName,
            metadata.description,
          );
        }
      });

      return instance;
    };

    // Copy prototype so instanceof operator still works
    newConstructor.prototype = originalConstructor.prototype;

    // Return the new constructor
    return newConstructor;
  };
}
