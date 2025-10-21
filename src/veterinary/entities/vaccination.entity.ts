import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { PetEntity } from '../../pets/entities/pet.entity';
import { VeterinaryRecordEntity } from './veterinary-record.entity';
import { EmployeeEntity } from '../../employees/entities/employee.entity';

@Entity('vaccinations')
@Index('IDX_VACCINATION_PET', ['petId', 'applicationDate'])
export class VaccinationEntity extends BaseEntity {
  @Column({ name: 'pet_id' })
  petId: string;

  @ManyToOne(() => PetEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pet_id' })
  pet: PetEntity;

  @Column({ name: 'record_id', nullable: true })
  recordId: string | null;

  @ManyToOne(() => VeterinaryRecordEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'record_id' })
  record: VeterinaryRecordEntity;

  @Column({ name: 'vaccine_name', type: 'varchar', length: 255 })
  vaccineName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  manufacturer: string | null;

  @Column({ name: 'batch_number', type: 'varchar', length: 100, nullable: true })
  batchNumber: string | null;

  @Column({ name: 'application_date', type: 'date' })
  applicationDate: Date;

  @Column({ name: 'next_dose_date', type: 'date', nullable: true })
  nextDoseDate: Date | null;

  @Column({ name: 'veterinarian_id' })
  veterinarianId: string;

  @ManyToOne(() => EmployeeEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'veterinarian_id' })
  veterinarian: EmployeeEntity;

  @Column({ type: 'text', nullable: true })
  notes: string | null;
}

