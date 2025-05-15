import { MethodRegistry } from '@/frameworks/data-services/method-collector/method-registry.service';
import { SetMetadata } from '@nestjs/common';

export const COLLECTED_METHOD_KEY = 'collected_method';

/**
 * Decorator to collect method references across the application
 * @param controlName Name of the control group
 * @param description Description of the method
 */
export function CollectMethod(controlName: string, description: string) {
  return (target: any, methodName: string, descriptor: PropertyDescriptor) => {
    // Register the method in our registry
    MethodRegistry.registerMethod(
      controlName,
      description,
      target,
      methodName,
      descriptor,
    );

    // Also set metadata for potential NestJS DI usage
    return SetMetadata(COLLECTED_METHOD_KEY, {
      controlName,
      methodName,
      description,
    })(target, methodName, descriptor);
  };
}
