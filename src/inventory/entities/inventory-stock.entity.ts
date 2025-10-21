import { Entity, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { OrganizationEntity } from '../../organizations/entities/organization.entity';
import { StoreEntity } from '../../stores/entities/store.entity';
import { ProductEntity } from './product.entity';

@Entity('inventory_stocks')
export class InventoryStockEntity {
  @Column({ type: 'varchar', length: '36', primary: true })
  id: string;

  @Column({ name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => OrganizationEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'organization_id' })
  organization: OrganizationEntity;

  @Column({ name: 'store_id' })
  storeId: string;

  @ManyToOne(() => StoreEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity;

  @Column({ name: 'product_id' })
  productId: string;

  @ManyToOne(() => ProductEntity, (product) => product.stocks, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  reserved: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  available: number;

  @Column({ name: 'last_count_at', type: 'timestamp', nullable: true })
  lastCountAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

