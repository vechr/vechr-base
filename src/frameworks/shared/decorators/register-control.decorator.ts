import { HandlerRegistryService } from '../../../modules/messaging/domain/usecases/services/handler-registry.service';
import { SetMetadata } from '@nestjs/common';

// Metadata keys
export const CONTROL_METADATA_KEY = 'control:metadata';

export interface ControlMetadata {
  handlerType: string;
  name: string;
  description: string;
}

/**
 * Decorator for automatically registering control methods with HandlerRegistryService
 *
 * @param handlerType The type of handler (SystemControl, SystemMonitor, etc.)
 * @param name The name of the control (defaults to method name)
 * @param description A description of what the control method does
 */
export function RegisterControl(
  handlerType: string,
  name?: string,
  description: string = '',
): MethodDecorator {
  return (
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    // Default name to the method name if not provided
    const controlName = name || String(propertyKey);
    const controlDescription = description || `${controlName} control method`;

    // Store metadata to be processed during module initialization
    SetMetadata(CONTROL_METADATA_KEY, {
      handlerType,
      name: controlName,
      description: controlDescription,
    })(target, propertyKey, descriptor);

    return descriptor;
  };
}

/**
 * Helper function to register controls from controller instance
 * To be called during module initialization
 */
export function registerControlsFromMetadata(
  instance: any,
  handlerRegistryService: HandlerRegistryService,
): void {
  // Get the prototype of the instance
  const prototype = Object.getPrototypeOf(instance);

  // Get all method names (including inherited ones)
  const propertyNames = getAllMethodNames(prototype);

  propertyNames.forEach((propertyName) => {
    const descriptor = Object.getOwnPropertyDescriptor(prototype, propertyName);
    if (!descriptor) return;

    // Check if the method has control metadata
    const metadata = Reflect.getMetadata(
      CONTROL_METADATA_KEY,
      prototype,
      propertyName,
    );
    if (metadata) {
      const { handlerType, name, description } = metadata as ControlMetadata;

      // Register the control with the HandlerRegistryService
      handlerRegistryService.registerControl(handlerType, name, description);
    }
  });
}

/**
 * Get all method names from an object prototype
 */
function getAllMethodNames(obj: any): string[] {
  let methods: string[] = [];
  let currentObj = obj;

  // Walk up the prototype chain
  while (currentObj && currentObj !== Object.prototype) {
    // Get all property names of the current object
    const objProps = Object.getOwnPropertyNames(currentObj);

    // Filter out properties that are not methods
    methods = methods.concat(
      objProps.filter((prop) => {
        const descriptor = Object.getOwnPropertyDescriptor(currentObj, prop);
        return (
          descriptor &&
          typeof descriptor.value === 'function' &&
          prop !== 'constructor'
        );
      }),
    );

    // Move up the prototype chain
    currentObj = Object.getPrototypeOf(currentObj);
  }

  return [...new Set(methods)]; // Remove duplicates
}
