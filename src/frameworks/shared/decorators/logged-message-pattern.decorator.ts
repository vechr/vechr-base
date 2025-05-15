import { MessagePattern } from '@nestjs/microservices';
import { log } from '../utils';
import { Control } from './register-controls.decorator';

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
      Control(description)(target, propertyKey, descriptor);
    }

    // Apply the MessagePattern decorator
    return MessagePattern(subject)(target, propertyKey, descriptor);
  };
}
