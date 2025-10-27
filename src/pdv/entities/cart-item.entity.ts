import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum CartItemType {
  SERVICE = 'SERVICE',
  PRODUCT = 'PRODUCT',
}

@Entity('cart_items')
export class CartItemEntity {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'uuid' })
  cartId: string;

  @Column({ type: 'uuid' })
  organizationId: string;

  @Column({ type: 'uuid' })
  storeId: string;

  @Column({
    type: 'enum',
    enum: CartItemType,
  })
  type: CartItemType;

  @Column({ type: 'uuid', nullable: true })
  serviceId: string;

  @Column({ type: 'uuid', nullable: true })
  productId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  itemCode: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  // Relations (temporarily disabled for debugging)
  // @ManyToOne(() => CartEntity, (cart) => cart.items, { onDelete: 'CASCADE' })
  // @JoinColumn({ name: 'cartId' })
  // cart: CartEntity;

  // @ManyToOne(() => ServiceEntity, { nullable: true })
  // @JoinColumn({ name: 'serviceId' })
  // service: ServiceEntity;

  // @ManyToOne(() => ProductEntity, { nullable: true })
  // @JoinColumn({ name: 'productId' })
  // product: ProductEntity;
}
