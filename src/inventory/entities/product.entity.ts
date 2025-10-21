import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { OrganizationEntity } from '../../organizations/entities/organization.entity';
import { InventoryStockEntity } from './inventory-stock.entity';

export enum ProductCategory {
  FOOD = 'FOOD',                     // Ração, petiscos
  HYGIENE = 'HYGIENE',               // Shampoos, sabonetes
  MEDICINE = 'MEDICINE',             // Medicamentos, vacinas
  ACCESSORY = 'ACCESSORY',           // Coleiras, camas
  TOY = 'TOY',                       // Brinquedos
  SERVICE_SUPPLY = 'SERVICE_SUPPLY', // Insumos para serviços
  OTHER = 'OTHER',
}

export enum ProductUnit {
  UNIT = 'UNIT',   // Unidade
  KG = 'KG',       // Quilograma
  G = 'G',         // Grama
  L = 'L',         // Litro
  ML = 'ML',       // Mililitro
  PACK = 'PACK',   // Pacote
  BOX = 'BOX',     // Caixa
}

@Entity('products')
export class ProductEntity extends BaseEntity {
  @Column({ name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => OrganizationEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'organization_id' })
  organization: OrganizationEntity;

  @Column({ length: 100 })
  code: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'enum',
    enum: ProductCategory,
    default: ProductCategory.OTHER,
  })
  category: ProductCategory;

  @Column({
    type: 'enum',
    enum: ProductUnit,
    default: ProductUnit.UNIT,
  })
  unit: ProductUnit;

  @Column({ name: 'cost_price_cents', type: 'int', nullable: true })
  costPriceCents: number | null;

  @Column({ name: 'sale_price_cents', type: 'int', nullable: true })
  salePriceCents: number | null;

  @Column({ name: 'min_stock', type: 'decimal', precision: 10, scale: 2, default: 0 })
  minStock: number;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @OneToMany(() => InventoryStockEntity, (stock) => stock.product)
  stocks: InventoryStockEntity[];
}

