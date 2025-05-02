import { HttpException, HttpStatus } from '@nestjs/common';
import { IErrorResponse } from '../responses/error.response';
/**
 * BaseException is a custom exception class extending NestJS's HttpException.
 * It allows attaching a custom error code and additional parameters to the error response.
 */
export class BaseException extends HttpException {
  /**
   * Creates a new instance of BaseException.
   * @param httpStatus - The HTTP status code to be returned.
   * @param code - A custom application-specific error code.
   * @param message - A human-readable error message.
   * @param params - Optional additional parameters relevant to the error.
   */
  constructor(
    public httpStatus: HttpStatus,
    private code: string,
    public message: string,
    private params: Record<string, any> = {},
  ) {
    super(message, httpStatus);
  }

  public getHttpCode(): HttpStatus {
    return this.httpStatus;
  }

  public getResponse(): IErrorResponse {
    return {
      code: this.code,
      params: this.params,
    };
  }
}
