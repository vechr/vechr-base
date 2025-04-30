import { DeviceType } from './device-type.entity';

export class ListDeviceTypeSerializer implements DeviceType {
  name: string;
  description: string | null;
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export class CreateDeviceTypeSerializer implements DeviceType {
  name: string;
  description: string | null;
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
export class UpsertDeviceTypeSerializer extends CreateDeviceTypeSerializer {}
export class UpdateDeviceTypeSerializer extends CreateDeviceTypeSerializer {}
export class DeleteDeviceTypeSerializer extends CreateDeviceTypeSerializer {}
export class GetDeviceTypeSerializer extends CreateDeviceTypeSerializer {}
