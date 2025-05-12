import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { NatsContext } from '@nestjs/microservices';
import { TCompactAuthUser } from '@/domain';
import { IContext, IContextParams } from './context.interceptor';

export class RpcContextInterceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    // Check if the request is RPC
    const type = ctx.getType();
    if (type !== 'rpc') {
      return next.handle(); // Skip authentication for non-RPC requests
    }

    const rpcContext = ctx.switchToRpc();
    const data = rpcContext.getData();
    const natsContext = rpcContext.getContext<NatsContext>();

    const context: IContext = {
      headers: {
        ...natsContext?.getHeaders(),
        'x-nats-subject': natsContext?.getSubject(),
      },
      user: data.user as TCompactAuthUser,
      params: this.extractParams(data),
      accessToken: data.token?.accessToken,
      refreshToken: data.token?.refreshToken,
    };

    // Attach context to the data object
    Object.defineProperty(data, 'customContext', {
      value: context,
      writable: false,
    });

    return next.handle();
  }

  private extractParams(data: any): IContextParams {
    // Handle null, undefined, or non-object data
    if (!data || typeof data !== 'object') {
      return { params: {}, query: {}, body: {} };
    }

    // List of fields to exclude from the body
    const excludedFields = [
      'accessToken',
      'token',
      'headers',
      'customContext',
      'user',
      'password',
      'refreshToken',
      'authorization',
      'x-access-token',
      'x-refresh-token',
      'x-api-key',
      'apiKey',
      'secret',
      'credentials',
      'auth',
      'authentication',
      'session',
      'sessionId',
      'jwt',
      'jwtToken',
      'bearer',
      'bearerToken',
    ];

    // Create a copy of the data to avoid modifying the original
    const dataCopy = { ...data };

    // Remove sensitive and context-related fields
    excludedFields.forEach((field) => {
      delete dataCopy[field];
    });

    // Extract query parameters if they exist
    const query = dataCopy.query || {};
    delete dataCopy.query;

    // Extract URL parameters if they exist
    const params = dataCopy.params || {};
    delete dataCopy.params;

    // The remaining data becomes the body
    const body = dataCopy;

    return {
      params,
      query,
      body,
    };
  }
}
