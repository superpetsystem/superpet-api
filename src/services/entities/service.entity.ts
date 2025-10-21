import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { OrganizationEntity } from '../../organizations/entities/organization.entity';
import { CustomServiceEntity } from './custom-service.entity';

export enum ServiceVisibility {
  PUBLIC = 'PUBLIC',
  INTERNAL = 'INTERNAL',
  HIDDEN = 'HIDDEN',
}

@Entity('services')
export class ServiceEntity extends BaseEntity {
  @Column({ name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => OrganizationEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'organization_id' })
  organization: OrganizationEntity;

  @Column({ type: 'varchar', length: 50 })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'duration_minutes', type: 'int' })
  durationMinutes: number;

  @Column({ name: 'buffer_before', type: 'int', default: 0 })
  bufferBefore: number;

  @Column({ name: 'buffer_after', type: 'int', default: 0 })
  bufferAfter: number;

  @Column({ name: 'resources_required', type: 'json', nullable: true })
  resourcesRequired: string[] | null;

  @Column({
    type: 'enum',
    enum: ServiceVisibility,
    default: ServiceVisibility.PUBLIC,
  })
  visibility: ServiceVisibility;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @Column({ name: 'price_base_cents', type: 'int' })
  priceBaseCents: number;

  @Column({ name: 'tax_code', type: 'varchar', length: 50, nullable: true })
  taxCode: string | null;

  @Column({ type: 'json', nullable: true })
  addons: string[] | null;

  @OneToMany(() => CustomServiceEntity, (custom) => custom.service)
  customServices: CustomServiceEntity[];
}
