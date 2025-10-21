import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { StoreEntity } from '../../stores/entities/store.entity';
import { ServiceEntity, ServiceVisibility } from './service.entity';

export enum CustomServiceState {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

@Entity('custom_services')
export class CustomServiceEntity extends BaseEntity {
  @Column({ name: 'store_id' })
  storeId: string;

  @ManyToOne(() => StoreEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity;

  @Column({ name: 'service_id' })
  serviceId: string;

  @ManyToOne(() => ServiceEntity, (service) => service.customServices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'service_id' })
  service: ServiceEntity;

  @Column({
    type: 'enum',
    enum: CustomServiceState,
    default: CustomServiceState.DRAFT,
  })
  state: CustomServiceState;

  @Column({ name: 'price_override_cents', type: 'int', nullable: true })
  priceOverrideCents: number | null;

  @Column({ name: 'duration_minutes_override', type: 'int', nullable: true })
  durationMinutesOverride: number | null;

  @Column({
    name: 'visibility_override',
    type: 'enum',
    enum: ServiceVisibility,
    enumName: 'service_visibility_enum',
    nullable: true,
  })
  visibilityOverride: ServiceVisibility | null;

  @Column({ name: 'resources_override', type: 'json', nullable: true })
  resourcesOverride: string[] | null;

  @Column({ name: 'addons_override', type: 'json', nullable: true })
  addonsOverride: string[] | null;

  @Column({ name: 'local_notes', type: 'text', nullable: true })
  localNotes: string | null;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;
}

