import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IContext } from '../interceptors/context.interceptor';

export const Context = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<
      Request & {
        customContext: IContext;
      }
    >();

    if (data) {
      return request.customContext[data];
    }

    return request.customContext;
  },
);
