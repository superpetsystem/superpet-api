import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { CartEntity } from './cart.entity';

export enum PaymentMethod {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  PIX = 'PIX',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CHECK = 'CHECK',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

@Entity('transactions')
export class TransactionEntity extends BaseEntity {

  @Column({ type: 'uuid' })
  organizationId: string;

  @Column({ type: 'uuid' })
  storeId: string;

  @Column({ type: 'uuid' })
  cartId: string;

  @Column({ type: 'uuid' })
  employeeId: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  transactionNumber: string;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  paymentMethod: PaymentMethod;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  changeAmount: number;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  externalTransactionId: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'json', nullable: true })
  paymentData: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  // Relations
  @ManyToOne(() => CartEntity)
  @JoinColumn({ name: 'cartId' })
  cart: CartEntity;
}
