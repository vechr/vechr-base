import {
  Controller,
  UseFilters,
  UseInterceptors,
  applyDecorators,
} from '@nestjs/common';
import { RpcExtendedExceptionFilter } from '../filters';
import { RpcContextInterceptor, RpcLoggingInterceptor } from '../interceptors';
import { RegisterControls } from '../decorators/register-controls.decorator';
import { log } from '../utils';

/**
 * Extended RPC controller decorator that applies:
 * 1. Standard RPC filters and interceptors
 * 2. Automatic control registration
 *
 * @param prefix Controller prefix (optional)
 */
export function RpcExtendedController(handlerType?: string) {
  log.debug(`Creating RpcExtendedController with handler type: ${handlerType}`);

  const decorators = [
    // Add standard Controller decorator
    Controller(),
    UseFilters(RpcExtendedExceptionFilter),
    UseInterceptors(RpcLoggingInterceptor),
    UseInterceptors(RpcContextInterceptor),
  ];

  // Add RegisterControls decorator if handlerType is provided
  if (handlerType) {
    log.debug(
      `Adding RegisterControls decorator with handler type: ${handlerType}`,
    );
    decorators.push(RegisterControls(handlerType));
  }

  return applyDecorators(...decorators);
}
