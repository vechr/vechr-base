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
 * This decorator will store metadata about the handler type on the class itself,
 * and will scan for methods that have the @Control decorator.
 *
 * This version works directly with method decorators to automatically register
 * control methods.
 *
 * Usage:
 * ```typescript
 * @Injectable()
 * @RegisterControls('MyHandlerType')
 * export class MyHandler {
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

    log.debug(
      `Found ${methodNames.length} methods in class ${target.name}: ${methodNames.join(', ')}`,
    );

    // Store info about which methods have the Control decorator
    const controlMethods: { name: string; description: string }[] = [];

    // Check each method for the Control decorator
    methodNames.forEach((methodName) => {
      const method = prototype[methodName];
      const metadata = Reflect.getMetadata(REGISTERED_CONTROLS, method);

      if (metadata) {
        log.debug(
          `Found Control decorator on ${target.name}.${methodName}: ${metadata.description}`,
        );
        controlMethods.push({
          name: methodName,
          description: metadata.description,
        });
      }
    });

    // Store the control methods on the class
    if (controlMethods.length > 0) {
      log.debug(
        `Saving ${controlMethods.length} control methods on ${target.name}`,
      );
      Reflect.defineMetadata('control_methods', controlMethods, target);

      // When an instance is created, we attempt to register the controls
      const originalConstructor = target;

      function newConstructor(...args: any[]) {
        const instance = new originalConstructor(...args);

        // Use setTimeout to ensure this runs after construction
        // This gives the DI container time to set up properties
        setTimeout(() => {
          try {
            // Try to find HandlerRegistryService
            const handlerRegistry =
              (global as any).handlerRegistryService ||
              instance.handlerRegistry;

            if (handlerRegistry instanceof HandlerRegistryService) {
              log.debug(
                `Registering ${controlMethods.length} controls for handler ${handlerType}`,
              );

              // Register each control method
              controlMethods.forEach((control) => {
                handlerRegistry.registerControl(
                  handlerType,
                  control.name,
                  control.description,
                );
              });
            } else {
              log.debug(
                `HandlerRegistryService not found when creating ${target.name}`,
              );
            }
          } catch (err: any) {
            log.error(
              `Error registering controls for ${target.name}: ${err.message}`,
            );
          }
        }, 100);

        return instance;
      }

      // Copy prototype and metadata so the new constructor works like the original
      newConstructor.prototype = originalConstructor.prototype;
      Object.getOwnPropertyNames(target).forEach((key) => {
        if (key !== 'prototype') {
          Object.defineProperty(
            newConstructor,
            key,
            Object.getOwnPropertyDescriptor(target, key) as PropertyDescriptor,
          );
        }
      });

      return newConstructor;
    }

    // If no control methods found, just return the original class
    return target;
  };
}
