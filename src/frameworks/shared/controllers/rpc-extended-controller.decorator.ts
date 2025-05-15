import { UseFilters, UseInterceptors, applyDecorators } from '@nestjs/common';
import { RpcExtendedExceptionFilter } from '../filters';
import { RpcContextInterceptor, RpcLoggingInterceptor } from '../interceptors';

export function RpcExtendedController() {
  return applyDecorators(
    UseFilters(RpcExtendedExceptionFilter),
    UseInterceptors(RpcLoggingInterceptor),
    UseInterceptors(RpcContextInterceptor),
  );
}
