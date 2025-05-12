import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IContext } from '../interceptors/context.interceptor';

const getHttpContext = (
  ctx: ExecutionContext,
  data?: string,
): IContext | null => {
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

  return null;
};

const getRpcContext = (
  ctx: ExecutionContext,
  data?: string,
): IContext | null => {
  const rpcContext = ctx.switchToRpc();
  const contextData = rpcContext.getData<{
    customContext: IContext;
  }>();

  if (contextData?.customContext) {
    if (data) {
      return contextData.customContext[data];
    }
    return contextData.customContext;
  }

  return null;
};

export const Context = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const type = ctx.getType();

    // Try HTTP context first
    if (type === 'http') {
      return getHttpContext(ctx, data);
    }

    // Try RPC context
    if (type === 'rpc') {
      return getRpcContext(ctx, data);
    }

    return null;
  },
);
