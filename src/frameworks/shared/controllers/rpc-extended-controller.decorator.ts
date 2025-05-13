import { UseFilters, applyDecorators } from '@nestjs/common';
import { RpcExtendedExceptionFilter } from '../filters';

export function RpcExtendedController() {
  return applyDecorators(UseFilters(RpcExtendedExceptionFilter));
}
