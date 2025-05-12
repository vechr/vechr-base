import { MessagePattern } from '@nestjs/microservices';
import { log } from '../utils';

export function LoggedMessagePattern(subject: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const className = target.constructor.name;
    log.info(
      `Registering message pattern for subject: ${subject} in class: ${className}`,
    );
    return MessagePattern(subject)(target, propertyKey, descriptor);
  };
}
