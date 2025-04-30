import {
  Prisma,
  Dashboard as TDashboard,
  DashboardDevice as TDashboardDevice,
} from '@prisma/client';
import { IListRequestQuery } from '@/core/base/domain/entities';
import { BaseEntity } from '@/core/base/domain/entities';
import { Device } from '@/modules/devices/domain/entities/device.entity';

export class Dashboard extends BaseEntity implements TDashboard {
  devices: DashboardDevice[];
}

export class DashboardDevice implements TDashboardDevice {
  deviceId: string;
  dashboardId: string;
  createdAt: Date;
  updatedAt: Date;
  device: Device;
}

export type OptionalDashboard = Partial<Dashboard>;
export type RequiredDashboard = Required<Dashboard>;
export type TListDashboardRequestQuery<P> = IListRequestQuery<
  P,
  Dashboard,
  Prisma.DashboardWhereInput
>;
export type TCreateDashboardRequestBody = Omit<
  Dashboard,
  'id' | 'createdAt' | 'updatedAt' | 'devices'
> & {
  devices: string[];
};
export type TUpsertDashboardRequestBody = TCreateDashboardRequestBody;
export type TUpdateDashboardRequestBody = Partial<TCreateDashboardRequestBody>;
