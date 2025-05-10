import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JsonWebTokenError } from 'jsonwebtoken';
import {
  IDecryptedJwt,
  cookieExtractor,
  decryptedDataUser,
} from '../shared/utils/jwt.util';
import { TCompactAuthUser } from '../../domain/entities/auth.entity';
import baseConfig from '@/config/base.config';

const { fromExtractors, fromAuthHeaderAsBearerToken } = ExtractJwt;

@Injectable()
export class AuthStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: (request) => {
        // Check if it's an RPC request
        if (request?.getType?.() === 'rpc') {
          const data = request.getData();
          const headers = request.getContext()?.getHeaders?.();

          // Try to get token from RPC data or headers
          return (
            data?.accessToken ||
            data?.token ||
            headers?.authorization?.split(' ')[1] ||
            headers?.['x-access-token'] ||
            headers?.['access-token']
          );
        }

        // For HTTP requests, use the default extractors
        return (
          fromExtractors([cookieExtractor, fromAuthHeaderAsBearerToken()])(
            request,
          ) ?? ExtractJwt.fromAuthHeaderAsBearerToken()(request)
        );
      },
      secretOrKey: baseConfig.jwt.secret,
    });
  }

  /**
   * The function "validate" asynchronously retrieves custom user data based on a decrypted JWT.
   * @param {IDecryptedJwt} jwt - The `jwt` parameter in the `validate` function is an object of type
   * `IDecryptedJwt`, which likely contains decrypted information from a JSON Web Token (JWT). This
   * information is used to retrieve a custom user object by calling the `getCustomUser` method
   * asynchronously. The function then returns
   * @returns The `customUser` object is being returned from the `validate` function.
   */
  async validate(jwt: IDecryptedJwt) {
    const customUser = await this.getCustomUser(jwt);

    return customUser;
  }

  /**
   * The function `getCustomUser` retrieves a custom user object from a decrypted JWT payload.
   * @param {IDecryptedJwt} jwt - The `jwt` parameter in the `getCustomUser` function is of type
   * `IDecryptedJwt`, which likely represents a JSON Web Token (JWT) that has been decrypted.
   * @returns The `getCustomUser` function is returning a Promise that resolves to a `TCompactAuthUser`
   * object.
   */
  private async getCustomUser(jwt: IDecryptedJwt): Promise<TCompactAuthUser> {
    const user = decryptedDataUser(jwt.payload);

    if (!user) {
      throw new JsonWebTokenError('sub not valid');
    }

    return user;
  }
}
