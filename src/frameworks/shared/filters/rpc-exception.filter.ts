import { ArgumentsHost, RpcExceptionFilter } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';
import { BaseRpcException } from '../exceptions/base.rpc.exception';
import { ErrorResponse } from '../responses/error.response';

export class ExtendedRpcExceptionFilter
  implements RpcExceptionFilter<RpcException>
{
  catch(exception: RpcException, host: ArgumentsHost): Observable<any> {
    // Check if the request is RPC
    const type = host.getType();
    if (type !== 'rpc') {
      return throwError(() => exception);
    }

    if (exception instanceof BaseRpcException) {
      const response = new ErrorResponse(
        exception.message,
        exception.getResponse(),
      );
      return throwError(() => response);
    }

    // Handle regular RpcException
    const error = exception.getError();
    const response = new ErrorResponse(
      typeof error === 'string' ? error : 'Internal server error',
      {
        code: 'INTERNAL_ERROR',
        params: {},
      },
    );
    return throwError(() => response);
  }
}
