import { UseFilters, UseInterceptors, applyDecorators } from '@nestjs/common';
import { RpcExtendedExceptionFilter } from '../filters';
import { RpcLoggingInterceptor } from '../interceptors';

export function RpcExtendedController() {
  return applyDecorators(
    UseFilters(RpcExtendedExceptionFilter),
    UseInterceptors(RpcLoggingInterceptor),
  );
}
