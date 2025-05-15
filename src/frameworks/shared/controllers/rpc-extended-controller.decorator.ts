import { UseFilters, UseInterceptors, applyDecorators } from '@nestjs/common';
import { RpcExtendedExceptionFilter } from '../filters';
import { RpcContextInterceptor, RpcLoggingInterceptor } from '../interceptors';
import { RegisterControls } from '../decorators/register-controls.decorator';

/**
 * Extended RPC controller decorator that applies:
 * 1. Standard RPC filters and interceptors
 * 2. Automatic control registration
 *
 * @param prefix Controller prefix (optional)
 */
export function RpcExtendedController(handlerType?: string) {
  const decorators = [
    // Only add Controller with prefix if prefix is provided
    UseFilters(RpcExtendedExceptionFilter),
    UseInterceptors(RpcLoggingInterceptor),
    UseInterceptors(RpcContextInterceptor),
  ];

  // Add RegisterControls decorator if handlerType is provided
  if (handlerType) {
    decorators.push(RegisterControls(handlerType));
  }

  return applyDecorators(...decorators);
}
