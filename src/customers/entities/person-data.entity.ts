import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { CustomerEntity } from './customer.entity';

export enum Gender {
  M = 'M',
  F = 'F',
  OTHER = 'OTHER',
  PREFER_NOT_SAY = 'PREFER_NOT_SAY',
}

@Entity('personal_data')
export class PersonDataEntity extends BaseEntity {
  @Column({ name: 'customer_id', unique: true })
  customerId: string;

  @OneToOne(() => CustomerEntity, (customer) => customer.personData, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer: CustomerEntity;

  @Column({ type: 'varchar', length: 11, nullable: true })
  cpf: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  rg: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  issuer: string | null;

  @Column({ type: 'date', nullable: true })
  birthdate: Date | null;

  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true,
  })
  gender: Gender | null;

  @Column({ name: 'guardian_name', type: 'varchar', length: 255, nullable: true })
  guardianName: string | null;

  @Column({ name: 'guardian_phone', type: 'varchar', length: 20, nullable: true })
  guardianPhone: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;
}
