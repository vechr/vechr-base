import { ErrorResponse, IErrorResponse, SuccessResponse } from '@/frameworks';

export class MessagingHandler {
  protected createSuccessResponse<T>(
    message: string,
    data: T,
  ): SuccessResponse<T> {
    return new SuccessResponse(message, data);
  }

  protected createErrorResponse(
    message: string,
    error: IErrorResponse,
  ): ErrorResponse {
    return new ErrorResponse(message, error);
  }
}
