import { Prisma, DeviceType as TDeviceType } from '@prisma/client';
import { IListRequestQuery } from '@/core/base/domain/entities';
import { BaseEntity } from '@/core/base/domain/entities';

export class DeviceType extends BaseEntity implements TDeviceType {}

export type OptionalDeviceType = Partial<DeviceType>;
export type RequiredDeviceType = Required<DeviceType>;
export type TListDeviceTypeRequestQuery<P> = IListRequestQuery<
  P,
  DeviceType,
  Prisma.DeviceTypeWhereInput
>;
export type TCreateDeviceTypeRequestBody = Omit<
  DeviceType,
  'id' | 'createdAt' | 'updatedAt'
>;
export type TUpsertDeviceTypeRequestBody = TCreateDeviceTypeRequestBody;
export type TUpdateDeviceTypeRequestBody =
  Partial<TCreateDeviceTypeRequestBody>;
