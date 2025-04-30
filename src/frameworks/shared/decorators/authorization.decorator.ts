import { SetMetadata } from '@nestjs/common';

export const Authorization = (...permissions: string[]) => {
  return SetMetadata('authorization', permissions);
};
