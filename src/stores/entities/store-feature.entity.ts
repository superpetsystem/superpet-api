import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { StoreEntity } from './store.entity';
import { FeatureEntity } from './feature.entity';

export interface FeatureLimits {
  dailyPickups?: number;
  maxConcurrentStreams?: number;
  maxAppointmentsPerDay?: number;
  [key: string]: any;
}

@Entity('store_features')
@Index('IDX_STORE_FEATURE_UNIQUE', ['storeId', 'featureKey'], { unique: true })
export class StoreFeatureEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'store_id' })
  storeId: string;

  @ManyToOne(() => StoreEntity, (store) => store.features, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity;

  @Column({ name: 'feature_key', type: 'varchar', length: 50 })
  featureKey: string; // Referência à feature.key (não FK para permitir soft delete)

  @ManyToOne(() => FeatureEntity, { eager: true })
  @JoinColumn({ name: 'feature_key', referencedColumnName: 'key' })
  feature?: FeatureEntity;

  @Column({ type: 'boolean', default: true })
  enabled: boolean;

  @Column({ type: 'json', nullable: true })
  limits: FeatureLimits | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

// Manter enum para compatibilidade com código legado (deprecado)
export enum FeatureKey {
  SERVICE_CATALOG = 'SERVICE_CATALOG',
  CUSTOM_SERVICE = 'CUSTOM_SERVICE',
  TELEPICKUP = 'TELEPICKUP',
  LIVE_CAM = 'LIVE_CAM',
}


