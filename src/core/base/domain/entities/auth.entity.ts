import { BaseEntity } from './base.entity';

export class AuthUser extends BaseEntity {
  email: string | null;
  phoneNumber: string | null;
  fullName: string | null;
  name: string;
  password: string;
  siteId: string;
  siteCode: string;
  roles: string[];
  permissions: string[];
}
export type TCompactAuthUser = Omit<
  AuthUser,
  'createdAt' | 'updatedAt' | 'password'
>;
export type OptionalAuthUser = Partial<AuthUser>;
