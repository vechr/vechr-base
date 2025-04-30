import { DeviceType } from '@/modules/device-types/domain/entities/device-type.entity';
import { Topic } from '@/modules/topics/domain/entities/topic.entity';
import { Device } from './device.entity';
import { Exclude } from 'class-transformer';

export class ListDeviceSerializer implements Device {
  deviceType: DeviceType;
  @Exclude()
  topics: Topic[];

  deviceTypeId: string;
  isActive: boolean;
  name: string;
  description: string | null;
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export class CreateDeviceSerializer implements Device {
  deviceType: DeviceType;
  @Exclude()
  topics: Topic[];

  deviceTypeId: string;
  isActive: boolean;
  name: string;
  description: string | null;
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
export class UpsertDeviceSerializer extends CreateDeviceSerializer {}
export class UpdateDeviceSerializer extends CreateDeviceSerializer {}
export class DeleteDeviceSerializer extends CreateDeviceSerializer {}
export class GetDeviceSerializer extends CreateDeviceSerializer {}
