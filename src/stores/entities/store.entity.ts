import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { OrganizationEntity } from '../../organizations/entities/organization.entity';
import { StoreFeatureEntity } from './store-feature.entity';

export interface StoreAddress {
  street: string;
  number?: string;
  district?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface OpeningHours {
  mon?: string[][];
  tue?: string[][];
  wed?: string[][];
  thu?: string[][];
  fri?: string[][];
  sat?: string[][];
  sun?: string[][];
}

export interface Capacity {
  [resource: string]: number;
}

@Entity('stores')
export class StoreEntity extends BaseEntity {
  @Column({ name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => OrganizationEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'organization_id' })
  organization: OrganizationEntity;

  @Column({ type: 'varchar', length: 50 })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 50, default: 'America/Manaus' })
  timezone: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null;

  @Column({ type: 'json', nullable: true })
  address: StoreAddress | null;

  @Column({ name: 'opening_hours', type: 'json', nullable: true })
  openingHours: OpeningHours | null;

  @Column({ name: 'blackout_dates', type: 'json', nullable: true })
  blackoutDates: string[] | null;

  @Column({ name: 'resources_catalog', type: 'json', nullable: true })
  resourcesCatalog: string[] | null;

  @Column({ type: 'json', nullable: true })
  capacity: Capacity | null;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @OneToMany(() => StoreFeatureEntity, (feature) => feature.store)
  features: StoreFeatureEntity[];
}
