import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { RpcAuthenticationGuard } from '../guards/rpc-authentication.guard';

export function RpcAuth(...permissions: string[]) {
  return applyDecorators(
    SetMetadata('authorization', permissions),
    UseGuards(RpcAuthenticationGuard),
  );
}
