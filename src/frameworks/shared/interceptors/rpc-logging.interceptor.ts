import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { log } from '../utils/log.util';

@Injectable()
export class RpcLoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const rpcContext = context.switchToRpc();
    const pattern = context.getHandler().name;
    const data = rpcContext.getData();
    const startTime = Date.now();
    const requestId = `rpc-${Date.now()}`;

    // Log RPC request
    log.info('Incoming RPC Request', {
      type: 'RPC_REQUEST',
      requestId,
      pattern,
      data: this.sanitizeBody(data),
      timestamp: new Date().toISOString(),
    });

    return next.handle().pipe(
      tap({
        next: (response: any) => {
          const responseTime = Date.now() - startTime;
          log.info('RPC Response', {
            type: 'RPC_RESPONSE',
            requestId,
            pattern,
            responseTime: `${responseTime}ms`,
            response: this.sanitizeBody(response),
            timestamp: new Date().toISOString(),
          });
        },
        error: (error: any) => {
          const responseTime = Date.now() - startTime;
          log.error('RPC Error', {
            type: 'RPC_ERROR',
            requestId,
            pattern,
            responseTime: `${responseTime}ms`,
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
          });
        },
      }),
    );
  }

  /**
   * Sanitize sensitive data from body
   * @param body The request/response body
   * @returns Sanitized body
   */
  private sanitizeBody(body: any): any {
    if (!body) return body;

    const sensitiveFields = ['password', 'token', 'authorization', 'apiKey'];
    const sanitized = { ...body };

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}
