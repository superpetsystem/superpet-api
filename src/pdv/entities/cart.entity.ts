import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { CustomerEntity } from '../../customers/entities/customer.entity';
import { StoreEntity } from '../../stores/entities/store.entity';
import { CartItemEntity } from './cart-item.entity';
import { TransactionEntity } from './transaction.entity';

export enum CartStatus {
  OPEN = 'OPEN',
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  COMPLETED = 'COMPLETED',
  ABANDONED = 'ABANDONED',
  CANCELLED = 'CANCELLED',
}

@Entity('carts')
export class CartEntity {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'uuid' })
  organizationId: string;

  @Column({ type: 'uuid' })
  storeId: string;

  @Column({ type: 'uuid', nullable: true })
  customerId: string;

  @Column({ type: 'uuid', nullable: true })
  employeeId: string;

  @Column({
    type: 'enum',
    enum: CartStatus,
    default: CartStatus.OPEN,
  })
  status: CartStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  // Relations (temporarily disabled for debugging)
  // @ManyToOne(() => StoreEntity)
  // @JoinColumn({ name: 'storeId' })
  // store: StoreEntity;

  // @ManyToOne(() => CustomerEntity, { nullable: true })
  // @JoinColumn({ name: 'customerId' })
  // customer: CustomerEntity;

  // @OneToMany(() => CartItemEntity, (item) => item.cart, { cascade: true })
  // items: CartItemEntity[];

  // @OneToMany(() => TransactionEntity, (transaction) => transaction.cart)
  // transactions: TransactionEntity[];
}
