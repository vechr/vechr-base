import { BaseResponse } from './base.response';

export class SuccessResponse<T = any> extends BaseResponse<T, null> {
  constructor(
    public message: string,
    result: T,
    meta = {},
  ) {
    super(true, message, result, null, meta);
  }
}
