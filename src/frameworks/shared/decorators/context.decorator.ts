import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IContext } from '../interceptors/context.interceptor';

export const Context = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    // Try HTTP context first
    const httpRequest = ctx.switchToHttp().getRequest<
      Request & {
        customContext: IContext;
      }
    >();

    if (httpRequest?.customContext) {
      if (data) {
        return httpRequest.customContext[data];
      }
      return httpRequest.customContext;
    }

    // If not HTTP, try RPC context
    const rpcContext = ctx.switchToRpc();
    const messageData = rpcContext.getData<{
      customContext: IContext;
    }>();

    if (messageData?.customContext) {
      if (data) {
        return messageData.customContext[data];
      }
      return messageData.customContext;
    }

    return null;
  },
);
