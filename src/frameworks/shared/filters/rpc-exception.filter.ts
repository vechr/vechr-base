import { RpcExceptionFilter } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';

export class ExtendedRpcExceptionFilter
  implements RpcExceptionFilter<RpcException>
{
  catch(exception: RpcException): Observable<any> {
    return throwError(() => exception.getError());
  }
}
