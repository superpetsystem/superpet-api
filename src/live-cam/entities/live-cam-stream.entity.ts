import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { StoreEntity } from '../../stores/entities/store.entity';
import { PetEntity } from '../../pets/entities/pet.entity';

export enum StreamStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  EXPIRED = 'EXPIRED',
}

@Entity('live_cam_streams')
export class LiveCamStreamEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'store_id' })
  storeId: string;

  @ManyToOne(() => StoreEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity;

  @Column({ name: 'pet_id' })
  petId: string;

  @ManyToOne(() => PetEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pet_id' })
  pet: PetEntity;

  @Column({ name: 'service_context_id', type: 'varchar', length: 36, nullable: true })
  serviceContextId: string | null;

  @Column({ name: 'stream_url', type: 'varchar', length: 500 })
  streamUrl: string;

  @Column({
    type: 'enum',
    enum: StreamStatus,
    default: StreamStatus.ONLINE,
  })
  status: StreamStatus;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}




