import { applyDecorators, UseGuards } from '@nestjs/common';
import { SetMetadata } from '@nestjs/common';
import { AuthenticationGuard } from '../guards';

export function Auth(...permissions: string[]) {
  return applyDecorators(
    SetMetadata('authorization', permissions),
    UseGuards(AuthenticationGuard),
  );
}
