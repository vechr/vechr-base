import { MessagePattern } from '@nestjs/microservices';
import { log } from '../utils';
import { Control, REGISTERED_CONTROLS } from './register-controls.decorator';

/**
 * Decorator that combines MessagePattern with logging and Control registration.
 * This allows a method to be both a message handler and a registered control.
 *
 * @param subject The message subject pattern
 * @param description Optional description for the Control registration
 */
export function LoggedMessagePattern(subject: string, description?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const className = target.constructor.name;

    // Log registration
    log.info(
      `Registering message pattern for subject: ${subject} in class: ${className}`,
    );

    // Apply the Control decorator if description is provided
    if (description) {
      // Apply Control decorator directly
      const controlDecorator = Control(description);
      controlDecorator(target, propertyKey, descriptor);

      // Ensure the metadata is also stored directly on the descriptor value
      // This provides redundancy for metadata access
      if (descriptor && descriptor.value) {
        const metadata = { description };
        Reflect.defineMetadata(REGISTERED_CONTROLS, metadata, descriptor.value);
      }
    }

    // Apply the MessagePattern decorator
    return MessagePattern(subject)(target, propertyKey, descriptor);
  };
}
