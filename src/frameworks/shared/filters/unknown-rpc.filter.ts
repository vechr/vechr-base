import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { RpcUnknownException } from '../exceptions/common.rpc.exception';
import { ErrorResponse } from '../responses/error.response';
import { log } from '../utils/log.util';

@Catch()
export class UnknownRpcExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    // Check if the request is RPC
    const type = host.getType();
    if (type !== 'rpc') {
      return;
    }

    if (!(exception instanceof RpcException)) {
      log.error('Unhandled RPC Error!', exception);
    } else {
      log.error('Known RPC Error!', exception);
    }

    const ctx = host.switchToRpc();
    const data = ctx.getData();

    const { status, response } = this.prepareException(exception);

    return {
      status,
      response,
      data,
    };
  }

  private prepareException(exception: any): {
    status: HttpStatus;
    response: ErrorResponse;
  } {
    if (exception instanceof RpcException) {
      const error = exception.getError();
      const status = HttpStatus.INTERNAL_SERVER_ERROR;

      const errMessage =
        typeof error === 'object'
          ? (error as { error: string }).error || exception.message
          : exception.message;

      const response = new ErrorResponse(
        errMessage,
        typeof error === 'string'
          ? { code: '500', params: {} }
          : {
              code: '500',
              params: error,
            },
      );

      return { status, response };
    }

    const error = new RpcUnknownException({
      message: exception.name ? exception.name : 'internal server error!',
      params: this.processSomeMessage(exception),
    });

    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    const response = new ErrorResponse(error.message, error.getResponse());

    return { status, response };
  }

  public processSomeMessage(exception: any) {
    if (typeof exception.message === 'string') {
      return exception.message;
    }
    return exception;
  }
}
