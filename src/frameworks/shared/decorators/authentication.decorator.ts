import { UseGuards } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AuthenticationGuard } from '../guards/authentication.guard';

export function Authentication(auth: boolean) {
  if (auth) {
    return UseGuards(new AuthenticationGuard(new Reflector()));
  }
  return () => {
    return;
  };
}
