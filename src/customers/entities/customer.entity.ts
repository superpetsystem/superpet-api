import { Entity, Column, OneToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { AddressEntity } from './address.entity';
import { PersonDataEntity } from './person-data.entity';

@Entity('customers')
export class CustomerEntity extends BaseEntity {
  @Column({ name: 'user_id', unique: true })
  userId: string;

  @OneToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @OneToOne(() => AddressEntity, (address) => address.customer, {
    cascade: true,
    eager: true,
  })
  address: AddressEntity;

  @OneToOne(() => PersonDataEntity, (personData) => personData.customer, {
    cascade: true,
    eager: true,
  })
  personData: PersonDataEntity;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'boolean', default: true })
  active: boolean;
}

