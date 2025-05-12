import { UsePipes } from '@nestjs/common';
import { RpcListQueryPipe } from '../pipes/rpc-list-query.pipe';

interface ClassConstructor {
  new (...args: any[]): any;
}

export function RpcUseList(
  dto: ClassConstructor,
): MethodDecorator & ClassDecorator {
  return UsePipes(new RpcListQueryPipe(dto));
}
