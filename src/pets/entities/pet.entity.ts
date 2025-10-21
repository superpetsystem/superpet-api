import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { OrganizationEntity } from '../../organizations/entities/organization.entity';
import { CustomerEntity } from '../../customers/entities/customer.entity';

export enum PetSpecies {
  DOG = 'DOG',
  CAT = 'CAT',
  BIRD = 'BIRD',
  RABBIT = 'RABBIT',
  OTHER = 'OTHER',
}

export enum PetStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DECEASED = 'DECEASED',
}

@Entity('pets')
export class PetEntity extends BaseEntity {
  @Column({ name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => OrganizationEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'organization_id' })
  organization: OrganizationEntity;

  @Column({ name: 'customer_id' })
  customerId: string;

  @ManyToOne(() => CustomerEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer: CustomerEntity;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({
    type: 'enum',
    enum: PetSpecies,
  })
  species: PetSpecies;

  @Column({ type: 'varchar', length: 100, nullable: true })
  breed: string | null;

  @Column({ type: 'date', nullable: true })
  birthdate: Date | null;

  @Column({ name: 'weight_kg', type: 'decimal', precision: 5, scale: 2, nullable: true })
  weightKg: number | null;

  @Column({ type: 'json', nullable: true })
  allergies: string[] | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  microchip: string | null;

  @Column({
    type: 'enum',
    enum: PetStatus,
    default: PetStatus.ACTIVE,
  })
  status: PetStatus;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;
}
