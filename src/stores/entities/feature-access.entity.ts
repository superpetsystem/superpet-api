import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { StoreEntity } from './store.entity';
import { FeatureEntity } from './feature.entity';

export enum FeatureAccessType {
  STORE_ONLY = 'STORE_ONLY',           // Apenas para funcionários da loja
  STORE_AND_CUSTOMER = 'STORE_AND_CUSTOMER', // Para loja + clientes
}

export interface CustomerAccessConfig {
  // Configurações específicas para acesso do cliente
  allowSelfRegistration?: boolean;     // Cliente pode se cadastrar
  allowSelfService?: boolean;          // Cliente pode usar self-service
  requireApproval?: boolean;           // Requer aprovação da loja
  maxDailyUsage?: number;             // Máximo de uso por dia
  allowedCustomerRoles?: string[];     // Roles de cliente permitidas
  customLimits?: any;                 // Limites customizados
}

@Entity('store_feature_access')
@Index('IDX_STORE_FEATURE_ACCESS_UNIQUE', ['storeId', 'featureKey'], { unique: true })
export class StoreFeatureAccessEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'store_id' })
  storeId: string;

  @ManyToOne(() => StoreEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity;

  @Column({ name: 'feature_key', type: 'varchar', length: 50 })
  featureKey: string;

  @ManyToOne(() => FeatureEntity)
  @JoinColumn({ name: 'feature_key', referencedColumnName: 'key' })
  feature?: FeatureEntity;

  @Column({
    type: 'enum',
    enum: FeatureAccessType,
    default: FeatureAccessType.STORE_ONLY,
  })
  accessType: FeatureAccessType;

  @Column({ type: 'json', nullable: true })
  customerAccessConfig: CustomerAccessConfig | null;

  @Column({ type: 'boolean', default: true })
  enabled: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
