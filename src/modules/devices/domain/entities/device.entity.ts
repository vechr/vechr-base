import { Prisma, Device as TDevice } from '@prisma/client';
import { IListRequestQuery } from '@/core/base/domain/entities';
import { BaseEntity } from '@/core/base/domain/entities';
import { DeviceType } from '@/modules/device-types/domain/entities/device-type.entity';
import { Topic } from '@/modules/topics/domain/entities/topic.entity';

export class Device extends BaseEntity implements TDevice {
  deviceTypeId: string;
  isActive: boolean;
  deviceType: DeviceType;
  topics: Topic[];
}

export type OptionalDevice = Partial<Device>;
export type RequiredDevice = Required<Device>;
export type TListDeviceRequestQuery<P> = IListRequestQuery<
  P,
  Device,
  Prisma.DeviceWhereInput
>;
export type TCreateDeviceRequestBody = Omit<
  Device,
  'id' | 'createdAt' | 'updatedAt' | 'deviceType' | 'topics'
>;
export type TUpsertDeviceRequestBody = TCreateDeviceRequestBody;
export type TUpdateDeviceRequestBody = Partial<TCreateDeviceRequestBody>;
