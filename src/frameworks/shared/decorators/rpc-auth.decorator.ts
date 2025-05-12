import {
  applyDecorators,
  SetMetadata,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { RpcAuthenticationGuard } from '../guards/rpc-authentication.guard';
import { RpcContextInterceptor } from '../interceptors/rpc-context.interceptor';

export function RpcAuth(...permissions: string[]) {
  return applyDecorators(
    SetMetadata('authorization', permissions),
    UseGuards(RpcAuthenticationGuard),
    UseInterceptors(RpcContextInterceptor),
  );
}
