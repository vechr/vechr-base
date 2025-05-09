import { TCompactAuthUser } from '@/domain';
import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { IContext, IContextParams } from './context.interceptor';
import { JwtService } from '@nestjs/jwt';

export interface IRpcContext {
  pattern: string;
  transport: string;
  client: {
    id: string;
    host: string;
    port: number;
  };
  timestamp: number;
}

export class ContextRpcInterceptor implements NestInterceptor {
  constructor(private readonly jwtService: JwtService) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    const rpcContext = ctx.switchToRpc();
    const data = rpcContext.getData();
    const rpcMetadata = rpcContext.getContext<IRpcContext>();

    // Extract JWT from the data if it exists
    const accessToken = this.extractToken(data);
    const user = accessToken ? this.validateToken(accessToken) : null;

    // Extract NATS-specific headers
    const natsHeaders = this.extractNatsHeaders(rpcMetadata);

    const context: IContext = {
      headers: {
        ...this.extractHeaders(data),
        ...natsHeaders,
      },
      user: user as TCompactAuthUser,
      params: this.extractParams(data),
      accessToken,
    };

    // Attach context to the data object
    Object.defineProperty(data, 'customContext', {
      value: context,
      writable: false,
    });

    return next.handle();
  }

  private extractToken(data: any): string | undefined {
    if (!data) return undefined;

    // Handle different token formats in NATS messages
    if (typeof data === 'object') {
      return (
        data.accessToken ||
        data.token ||
        (data.headers && data.headers.authorization?.split(' ')[1]) ||
        (data.headers && data.headers['x-access-token'])
      );
    }
    return undefined;
  }

  private validateToken(token: string): TCompactAuthUser | null {
    try {
      return this.jwtService.verify(token) as TCompactAuthUser;
    } catch (_error) {
      return null;
    }
  }

  private extractHeaders(data: any): Record<string, any> {
    if (!data || typeof data !== 'object') return {};
    return data.headers || {};
  }

  private extractNatsHeaders(rpcMetadata: IRpcContext): Record<string, string> {
    if (!rpcMetadata) return {};

    return {
      'x-rpc-pattern': rpcMetadata.pattern,
      'x-rpc-transport': rpcMetadata.transport,
      'x-rpc-client-id': rpcMetadata.client?.id,
      'x-rpc-client-host': rpcMetadata.client?.host,
      'x-rpc-client-port': rpcMetadata.client?.port?.toString(),
      'x-rpc-timestamp': rpcMetadata.timestamp?.toString(),
    };
  }

  private extractParams(data: any): IContextParams {
    if (!data || typeof data !== 'object')
      return { params: {}, query: {}, body: {} };

    // Remove sensitive data and context-related fields
    const { accessToken, token, headers, customContext, ...rest } = data;

    return {
      params: {},
      query: {},
      body: rest,
    };
  }
}
