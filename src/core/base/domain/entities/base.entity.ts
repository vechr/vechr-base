export abstract class BaseCoreEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export abstract class BaseEntity extends BaseCoreEntity {
  name: string;
  description: string | null;
}

export type DropdownEntity<L, V> = {
  label: L;
  value: V;
};
