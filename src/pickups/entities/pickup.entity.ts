import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { StoreEntity } from '../../stores/entities/store.entity';
import { CustomerEntity } from '../../customers/entities/customer.entity';
import { PetEntity } from '../../pets/entities/pet.entity';

export enum PickupStatus {
  REQUESTED = 'REQUESTED',
  CONFIRMED = 'CONFIRMED',
  IN_ROUTE = 'IN_ROUTE',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED',
}

export interface AddressOverride {
  street: string;
  number?: string;
  district?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

@Entity('pickups')
export class PickupEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'store_id' })
  storeId: string;

  @ManyToOne(() => StoreEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity;

  @Column({ name: 'customer_id' })
  customerId: string;

  @ManyToOne(() => CustomerEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'customer_id' })
  customer: CustomerEntity;

  @Column({ name: 'pet_id' })
  petId: string;

  @ManyToOne(() => PetEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'pet_id' })
  pet: PetEntity;

  @Column({ name: 'pickup_window_start', type: 'timestamp' })
  pickupWindowStart: Date;

  @Column({ name: 'pickup_window_end', type: 'timestamp' })
  pickupWindowEnd: Date;

  @Column({ name: 'address_override', type: 'json', nullable: true })
  addressOverride: AddressOverride | null;

  @Column({
    type: 'enum',
    enum: PickupStatus,
    default: PickupStatus.REQUESTED,
  })
  status: PickupStatus;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}


