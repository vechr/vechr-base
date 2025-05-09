import { BaseRpcException } from './base.rpc.exception';

export enum ERpcErrorCommonCode {
  BAD_REQUEST = 'R400',
  UNAUTHORIZED = 'R401',
  FORBIDDEN = 'R403',
  NOT_FOUND = 'R404',
  INTERNAL_SERVER_ERROR = 'R500',
  DUPLICATE = 'R409',
}

export class RpcDuplicateException extends BaseRpcException {
  constructor(payload?: {
    message?: string;
    code?: string;
    params?: Record<string, any>;
  }) {
    super(
      payload?.code || ERpcErrorCommonCode.DUPLICATE,
      payload?.message || 'Duplicate!',
      payload?.params || {},
    );
  }
}

export class RpcBadRequestException extends BaseRpcException {
  constructor(payload?: {
    message?: string;
    code?: string;
    params?: Record<string, any>;
  }) {
    super(
      payload?.code || ERpcErrorCommonCode.BAD_REQUEST,
      payload?.message || 'Bad request!',
      payload?.params || {},
    );
  }
}

export class RpcUnauthorizedException extends BaseRpcException {
  constructor(payload?: {
    message?: string;
    code?: string;
    params?: Record<string, any>;
  }) {
    super(
      payload?.code || ERpcErrorCommonCode.UNAUTHORIZED,
      payload?.message || 'Unauthorized!',
      payload?.params || {},
    );
  }
}

export class RpcForbiddenException extends BaseRpcException {
  constructor(payload?: {
    message?: string;
    code?: string;
    params?: Record<string, any>;
  }) {
    super(
      payload?.code || ERpcErrorCommonCode.FORBIDDEN,
      payload?.message || 'Forbidden!',
      payload?.params || {},
    );
  }
}

export class RpcNotFoundException extends BaseRpcException {
  constructor(payload?: {
    message?: string;
    code?: string;
    params?: Record<string, any>;
  }) {
    super(
      payload?.code || ERpcErrorCommonCode.NOT_FOUND,
      payload?.message || 'Not found!',
      payload?.params || {},
    );
  }
}

export class RpcUnknownException extends BaseRpcException {
  constructor(payload?: {
    message?: string;
    code?: string;
    params?: Record<string, any>;
  }) {
    super(
      payload?.code || ERpcErrorCommonCode.INTERNAL_SERVER_ERROR,
      payload?.message || 'Internal server error!',
      payload?.params || {},
    );
  }
}
