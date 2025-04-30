import { UseInterceptors } from '@nestjs/common';
import { LoginInterceptor } from '../interceptors/login.interceptor';
import { LogoutInterceptor } from '../interceptors/logout.interceptor';

export function CookieAuthentication(
  method: 'logout' | 'login',
): MethodDecorator & ClassDecorator {
  if (method === 'logout') {
    return UseInterceptors(new LogoutInterceptor());
  }
  return UseInterceptors(new LoginInterceptor());
}
