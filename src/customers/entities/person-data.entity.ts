import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { CustomerEntity } from './customer.entity';

export enum DocumentType {
  CPF = 'cpf',
  CNPJ = 'cnpj',
  RG = 'rg',
  PASSPORT = 'passport',
}

@Entity('person_data')
export class PersonDataEntity extends BaseEntity {
  @Column({ name: 'customer_id' })
  customerId: string;

  @OneToOne(() => CustomerEntity, (customer) => customer.personData, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'customer_id' })
  customer: CustomerEntity;

  @Column({ type: 'varchar', length: 255 })
  fullName: string;

  @Column({
    type: 'enum',
    enum: DocumentType,
  })
  documentType: DocumentType;

  @Column({ type: 'varchar', length: 20, unique: true })
  documentNumber: string;

  @Column({ type: 'date', nullable: true })
  birthDate: Date | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phoneAlternative: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  emailAlternative: string | null;
}

