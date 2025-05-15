import { MessagePattern } from '@nestjs/microservices';
import { log } from '../utils';
import { CollectMethod } from './method-collector.decorator';

/**
 * Decorator that combines MessagePattern with logging and method collection.
 * This allows a method to be both a message handler and a collected control.
 *
 * @param subject The message subject pattern
 * @param description Optional description for the control registration
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

    // Apply the CollectMethod decorator if description is provided
    if (description) {
      CollectMethod(subject, description)(target, propertyKey, descriptor);
    } else {
      // Use a default description if none provided
      const defaultDescription = `Handles ${subject} messages`;
      CollectMethod(subject, defaultDescription)(
        target,
        propertyKey,
        descriptor,
      );
    }

    // Apply the MessagePattern decorator
    return MessagePattern(subject)(target, propertyKey, descriptor);
  };
}
