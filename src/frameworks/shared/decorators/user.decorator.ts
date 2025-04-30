import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IContext } from '../interceptors/context.interceptor';

export const User = createParamDecorator(
  (_data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<
      Request & {
        customContext: IContext;
      }
    >();

    return request.customContext?.user;
  },
);
