import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import {
  ForbiddenException,
  UnauthorizedException,
} from '../exceptions/common.exception';
import log from '../utils/log.util';
import { TCompactAuthUser } from '@/domain';

enum EErrorJwtCode {
  TOKEN_EXPIRED = 'T401',
  TOKEN_INVALID = 'T402',
  TOKEN_REQUIRED = 'T403',
}

export class AuthenticationGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  handleRequest<TUser = TCompactAuthUser>(
    err: any,
    user: TCompactAuthUser,
    info: any,
    context: any,
  ): TUser {
    if (info) {
      if (info instanceof TokenExpiredError) {
        throw new UnauthorizedException({
          message: 'Token expired!',
          code: EErrorJwtCode.TOKEN_EXPIRED,
          params: { message: info.message },
        });
      }
      if (info instanceof JsonWebTokenError) {
        throw new UnauthorizedException({
          message: 'Token expired!',
          code: EErrorJwtCode.TOKEN_EXPIRED,
          params: { message: info.message },
        });
      }
    }

    if (err || info || !user) {
      if (!user) {
        throw new UnauthorizedException({
          message: 'Token required!',
          code: EErrorJwtCode.TOKEN_REQUIRED,
          params: {
            message: err?.message || info?.message || 'user not found!',
          },
        });
      } else {
        throw new UnauthorizedException({
          message: 'Invalid token!',
          code: EErrorJwtCode.TOKEN_INVALID,
          params: {
            message:
              err?.message || info?.message || "it's look like token is wrong!",
          },
        });
      }
    }

    let isAuthorized = true;
    try {
      const requiredRoles: string[] = [
        'root', // Make Admin will have access for all features
        ...this.reflector.getAllAndOverride<string[]>('authorization', [
          context.getHandler(),
          context.getClass(),
        ]),
      ];

      const intersectedRoles = requiredRoles.filter((value) =>
        user.permissions.includes(value),
      );

      isAuthorized = !!intersectedRoles.length;
    } catch (_error) {
      const req = context.getRequest();
      log.warn(`skip authorization for ${req.route?.path || req.url}`);
    }

    if (!isAuthorized) {
      throw new ForbiddenException();
    }

    return user as TUser;
  }
}
