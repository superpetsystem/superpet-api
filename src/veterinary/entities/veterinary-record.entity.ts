import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { OrganizationEntity } from '../../organizations/entities/organization.entity';
import { PetEntity } from '../../pets/entities/pet.entity';
import { StoreEntity } from '../../stores/entities/store.entity';
import { EmployeeEntity } from '../../employees/entities/employee.entity';

export enum RecordType {
  CONSULTATION = 'CONSULTATION',
  SURGERY = 'SURGERY',
  VACCINATION = 'VACCINATION',
  EXAM = 'EXAM',
  EMERGENCY = 'EMERGENCY',
  FOLLOW_UP = 'FOLLOW_UP',
}

@Entity('veterinary_records')
@Index('IDX_VET_RECORD_PET', ['petId', 'visitDate'])
@Index('IDX_VET_RECORD_VET', ['veterinarianId'])
export class VeterinaryRecordEntity extends BaseEntity {
  @Column({ name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => OrganizationEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'organization_id' })
  organization: OrganizationEntity;

  @Column({ name: 'pet_id' })
  petId: string;

  @ManyToOne(() => PetEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'pet_id' })
  pet: PetEntity;

  @Column({ name: 'store_id' })
  storeId: string;

  @ManyToOne(() => StoreEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity;

  @Column({ name: 'veterinarian_id' })
  veterinarianId: string;

  @ManyToOne(() => EmployeeEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'veterinarian_id' })
  veterinarian: EmployeeEntity;

  @Column({
    type: 'enum',
    enum: RecordType,
  })
  type: RecordType;

  @Column({ name: 'visit_date', type: 'timestamp' })
  visitDate: Date;

  @Column({ type: 'text' })
  reason: string;

  @Column({ type: 'text', nullable: true })
  symptoms: string | null;

  @Column({ type: 'text', nullable: true })
  diagnosis: string | null;

  @Column({ type: 'text', nullable: true })
  treatment: string | null;

  @Column({ type: 'json', nullable: true })
  prescriptions: any;

  @Column({ name: 'weight_kg', type: 'decimal', precision: 5, scale: 2, nullable: true })
  weightKg: number | null;

  @Column({ name: 'temperature_celsius', type: 'decimal', precision: 4, scale: 1, nullable: true })
  temperatureCelsius: number | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;
}

