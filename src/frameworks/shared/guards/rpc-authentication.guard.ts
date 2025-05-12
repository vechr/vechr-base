import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { Reflector } from '@nestjs/core';
import { NatsContext, RpcException } from '@nestjs/microservices';
import { RpcForbiddenException, RpcUnauthorizedException } from '../exceptions';
import baseConfig from '@/config/base.config';
import { decryptedDataUser } from '../utils/jwt.util';
import { log } from '../utils';

enum EErrorJwtCode {
  TOKEN_EXPIRED = 'T401',
  TOKEN_INVALID = 'T402',
  TOKEN_REQUIRED = 'T403',
}

@Injectable()
export class RpcAuthenticationGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if the request is RPC
    const type = context.getType();
    if (type !== 'rpc') {
      return true; // Skip authentication for non-RPC requests
    }

    const request = context.switchToRpc();
    const data = request.getData();
    const natsContext = request.getContext<NatsContext>();

    try {
      // Extract tokens from NATS headers or data
      const tokens = this.extractToken(
        natsContext?.getHeaders()?.headers,
        data,
      );
      if (!tokens?.accessToken) {
        throw new RpcUnauthorizedException({
          message: 'Token required!',
          code: EErrorJwtCode.TOKEN_REQUIRED,
          params: { message: 'No token provided' },
        });
      }
      // Verify and decode the access token
      const decoded = this.jwtService.verify(tokens.accessToken, {
        secret: baseConfig.jwt.secret,
      });
      const user = decryptedDataUser(decoded.payload);

      if (!user) {
        throw new RpcUnauthorizedException({
          message: 'Invalid token!',
          code: EErrorJwtCode.TOKEN_INVALID,
          params: { message: 'Invalid user data in token' },
        });
      }

      // Check authorization
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
      } catch (error) {
        log.warn(`skip authorization for ${natsContext?.getSubject()}`, error);
      }

      if (!isAuthorized) {
        throw new RpcForbiddenException();
      }

      // Attach user to the request data
      Object.defineProperty(data, 'user', {
        value: user,
        writable: false,
      });

      // Attach token to the request data
      Object.defineProperty(data, 'token', {
        value: tokens,
        writable: false,
      });

      return true;
    } catch (error: any) {
      if (error instanceof TokenExpiredError) {
        throw new RpcException({
          message: 'Token expired!',
          code: EErrorJwtCode.TOKEN_EXPIRED,
          params: { message: error.message },
        });
      }
      if (error instanceof JsonWebTokenError) {
        throw new RpcException({
          message: 'Invalid token!',
          code: EErrorJwtCode.TOKEN_INVALID,
          params: { message: error.message },
        });
      }
      throw error;
    }
  }

  private extractToken(
    headers: Map<string, string[]> | undefined,
    data: any,
  ): { accessToken: string; refreshToken: string } | undefined {
    let accessToken: string | undefined;
    let refreshToken: string | undefined;

    // Try to get tokens from NATS headers first
    if (headers) {
      // Extract access token
      const authHeader = headers.get('Authorization');
      if (authHeader && authHeader.length > 0) {
        const [type, token] = authHeader[0].split(' ');
        if (type === 'Bearer' && token) {
          accessToken = token;
        }
      }

      const xAccessToken = headers.get('x-access-token');
      if (xAccessToken && xAccessToken.length > 0) {
        accessToken = xAccessToken[0];
      }

      const accessTokenHeader = headers.get('access-token');
      if (accessTokenHeader && accessTokenHeader.length > 0) {
        accessToken = accessTokenHeader[0];
      }

      // Extract refresh token
      const refreshTokenHeader = headers.get('refresh-token');
      if (refreshTokenHeader && refreshTokenHeader.length > 0) {
        refreshToken = refreshTokenHeader[0];
      }
    }

    // If no tokens in headers, try message data
    if (data && typeof data === 'object') {
      accessToken =
        accessToken ||
        data.accessToken ||
        data.token ||
        (data.headers && data.headers.authorization?.split(' ')[1]) ||
        (data.headers && data.headers['x-access-token']);

      refreshToken =
        refreshToken ||
        data.refreshToken ||
        (data.headers && data.headers['refresh-token']);
    }

    if (!accessToken) {
      return undefined;
    }

    return {
      accessToken,
      refreshToken: refreshToken || '',
    };
  }
}
