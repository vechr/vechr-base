import { TCompactAuthUser } from '@/domain';
import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { IContext, IContextParams } from './context.interceptor';
import { JwtService } from '@nestjs/jwt';
import { NatsContext } from '@nestjs/microservices';

export class ContextRpcInterceptor implements NestInterceptor {
  constructor(private readonly jwtService: JwtService) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    const rpcContext = ctx.switchToRpc();
    const data = rpcContext.getData();
    const natsContext = rpcContext.getContext<NatsContext>();

    // Extract JWT from both NATS headers and message data
    const accessToken = this.extractToken(natsContext?.getHeaders(), data);
    const user = accessToken ? this.validateToken(accessToken) : null;

    const context: IContext = {
      headers: {
        ...natsContext?.getHeaders(),
        'x-nats-subject': natsContext?.getSubject(),
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

  private extractToken(
    headers: Record<string, string> | undefined,
    data: any,
  ): string | undefined {
    // Try to get token from NATS headers first
    if (headers) {
      const headerToken =
        headers.authorization?.split(' ')[1] ||
        headers['x-access-token'] ||
        headers['access-token'];

      if (headerToken) return headerToken;
    }

    // If no token in headers, try message data
    if (data && typeof data === 'object') {
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
