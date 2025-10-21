import { Entity, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { OrganizationEntity } from '../../organizations/entities/organization.entity';
import { StoreEntity } from '../../stores/entities/store.entity';
import { ProductEntity } from './product.entity';
import { EmployeeEntity } from '../../employees/entities/employee.entity';

export enum MovementType {
  ENTRY = 'ENTRY',           // Entrada (compra, devolução)
  EXIT = 'EXIT',             // Saída (venda, uso em serviço)
  ADJUSTMENT = 'ADJUSTMENT', // Ajuste de inventário
  TRANSFER = 'TRANSFER',     // Transferência entre lojas
  LOSS = 'LOSS',             // Perda (vencimento, quebra)
  RETURN = 'RETURN',         // Devolução de fornecedor
}

@Entity('inventory_movements')
export class InventoryMovementEntity {
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

  @ManyToOne(() => ProductEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;

  @Column({
    type: 'enum',
    enum: MovementType,
  })
  type: MovementType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  reason: string | null;

  @Column({ name: 'reference_type', type: 'varchar', length: 50, nullable: true })
  referenceType: string | null;

  @Column({ name: 'reference_id', type: 'varchar', length: 36, nullable: true })
  referenceId: string | null;

  @Column({ name: 'employee_id', nullable: true })
  employeeId: string | null;

  @ManyToOne(() => EmployeeEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'employee_id' })
  employee: EmployeeEntity | null;

  @Column({ name: 'cost_price_cents', type: 'int', nullable: true })
  costPriceCents: number | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

