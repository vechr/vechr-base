import { UseInterceptors } from '@nestjs/common';
import { SerializerInterceptor } from '../interceptors/serializer.interceptor';

interface ClassConstructor {
  new (...args: any[]): any;
}

export function ExtendedSerializer(
  dto: ClassConstructor,
): MethodDecorator & ClassDecorator {
  return UseInterceptors(new SerializerInterceptor(dto));
}
