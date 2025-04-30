import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { SuccessResponse } from '../responses/success.response';
import { generateExpiredDateRefresh } from '../utils/jwt.util';
import baseConfig from '@/config/base.config';

export class LoginInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    handler: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    return handler.handle().pipe(
      map((data: SuccessResponse) => {
        const response = context.switchToHttp().getResponse();
        const result = data.result;

        response.cookie('access-token', result.token, {
          expires: result.expiredAt,
          sameSite: baseConfig.cookie?.sameSite,
          httpOnly: baseConfig.cookie?.httpOnly,
          secure: baseConfig.cookie?.secure,
        });

        response.cookie('refresh-token', result.refresh, {
          expires: generateExpiredDateRefresh(),
          sameSite: baseConfig.cookie?.sameSite,
          httpOnly: baseConfig.cookie?.httpOnly,
          secure: baseConfig.cookie?.secure,
        });

        return data;
      }),
    );
  }
}
