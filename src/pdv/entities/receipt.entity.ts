import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { CartEntity } from './cart.entity';

export enum ReceiptType {
  SALE = 'SALE',
  REFUND = 'REFUND',
  EXCHANGE = 'EXCHANGE',
}

@Entity('receipts')
export class ReceiptEntity extends BaseEntity {

  @Column({ type: 'uuid' })
  organizationId: string;

  @Column({ type: 'uuid' })
  storeId: string;

  @Column({ type: 'uuid' })
  cartId: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  receiptNumber: string;

  @Column({
    type: 'enum',
    enum: ReceiptType,
    default: ReceiptType.SALE,
  })
  type: ReceiptType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'json', nullable: true })
  receiptData: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  // Relations
  @ManyToOne(() => CartEntity)
  @JoinColumn({ name: 'cartId' })
  cart: CartEntity;
}
