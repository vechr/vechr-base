import { UseFilters, UsePipes, applyDecorators } from '@nestjs/common';
import { RpcExtendedExceptionFilter } from '../filters';
import { RpcBodyValidationPipe } from '../pipes';

export function RpcExtendedController() {
  return applyDecorators(
    UseFilters(RpcExtendedExceptionFilter),
    UsePipes(RpcBodyValidationPipe),
  );
}
