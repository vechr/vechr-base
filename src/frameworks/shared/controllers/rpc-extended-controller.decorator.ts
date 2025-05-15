import { UseFilters, UseInterceptors, applyDecorators } from '@nestjs/common';
import { RpcExtendedExceptionFilter } from '../filters';
import { RpcContextInterceptor, RpcLoggingInterceptor } from '../interceptors';

/**
 * Extended RPC controller decorator that applies:
 * 1. Standard RPC filters and interceptors
 *
 */
export function RpcExtendedController() {
  const decorators = [
    // Only add Controller with prefix if prefix is provided
    UseFilters(RpcExtendedExceptionFilter),
    UseInterceptors(RpcLoggingInterceptor),
    UseInterceptors(RpcContextInterceptor),
  ];
  return applyDecorators(...decorators);
}
