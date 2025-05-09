import { RpcException } from '@nestjs/microservices';
import { IErrorResponse } from '../responses/error.response';

/**
 * BaseRpcException is a custom exception class extending NestJS's RpcException.
 * It allows attaching a custom error code and additional parameters to the RPC error response.
 */
export class BaseRpcException extends RpcException {
  /**
   * Creates a new instance of BaseRpcException.
   * @param code - A custom application-specific error code.
   * @param message - A human-readable error message.
   * @param params - Optional additional parameters relevant to the error.
   */
  constructor(
    private code: string,
    public message: string,
    private params: Record<string, any> = {},
  ) {
    super({
      code,
      message,
      params,
    });
  }

  public getResponse(): IErrorResponse {
    return {
      code: this.code,
      params: this.params,
    };
  }
}
