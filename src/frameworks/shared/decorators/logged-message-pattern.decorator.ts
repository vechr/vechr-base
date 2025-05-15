import { MessagePattern } from '@nestjs/microservices';
import { log } from '../utils';
import { CollectMethod } from './method-collector.decorator';
import { SubjectFactory } from '@/modules/messaging/domain/usecases/factories/subject.factory';

/**
 * Decorator that combines MessagePattern with logging and method collection.
 * This allows a method to be both a message handler and a collected control.
 *
 * @param messageType The message subject pattern
 * @param action The action of the message
 * @param description Optional description for the control registration
 */
export function LoggedMessagePattern(
  messageType: string,
  action: string,
  description?: string,
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const className = target.constructor.name;

    const subject = SubjectFactory.buildSubject(messageType, action);

    // Log registration
    log.info(
      `Registering message pattern for messageType: ${messageType} in class: ${className}`,
    );

    // Apply the CollectMethod decorator if description is provided
    if (description) {
      CollectMethod(messageType, description)(target, propertyKey, descriptor);
    } else {
      // Use a default description if none provided
      const defaultDescription = `Handles ${messageType} messages`;
      CollectMethod(messageType, defaultDescription)(
        target,
        propertyKey,
        descriptor,
      );
    }

    // Apply the MessagePattern decorator
    return MessagePattern(subject)(target, propertyKey, descriptor);
  };
}
