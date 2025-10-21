import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

export enum FeatureCategory {
  CORE = 'CORE',           // Funcionalidades essenciais
  SERVICES = 'SERVICES',   // Serviços e agendamentos
  CUSTOMER = 'CUSTOMER',   // Relacionamento com cliente
  OPERATIONS = 'OPERATIONS', // Operações e logística
  ANALYTICS = 'ANALYTICS', // Relatórios e análises
  INTEGRATIONS = 'INTEGRATIONS', // Integrações externas
}

export enum OrganizationPlan {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
}

@Entity('features')
@Index('IDX_FEATURE_KEY', ['key'], { unique: true })
@Index('IDX_FEATURE_CATEGORY', ['category'])
@Index('IDX_FEATURE_PLAN', ['minPlanRequired'])
export class FeatureEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  key: string; // Ex: SERVICE_CATALOG, TELEPICKUP, ONLINE_BOOKING, etc

  @Column({ type: 'varchar', length: 100 })
  name: string; // Nome amigável

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: FeatureCategory,
    default: FeatureCategory.CORE,
  })
  category: FeatureCategory;

  @Column({
    name: 'min_plan_required',
    type: 'enum',
    enum: OrganizationPlan,
    default: OrganizationPlan.FREE,
  })
  minPlanRequired: OrganizationPlan; // Plano mínimo necessário

  @Column({ type: 'boolean', default: true })
  active: boolean; // Se a feature está ativa no sistema

  @Column({ name: 'default_limits', type: 'json', nullable: true })
  defaultLimits: any; // Limites padrão ao habilitar

  @Column({ type: 'json', nullable: true })
  metadata: any; // Configurações extras (ícone, cor, ordem de exibição, etc)
}

