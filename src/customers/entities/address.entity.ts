import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { CustomerEntity } from './customer.entity';

@Entity('addresses')
export class AddressEntity extends BaseEntity {
  @Column({ name: 'customer_id' })
  customerId: string;

  @OneToOne(() => CustomerEntity, (customer) => customer.address, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'customer_id' })
  customer: CustomerEntity;

  @Column({ type: 'varchar', length: 10 })
  zipCode: string;

  @Column({ type: 'varchar', length: 255 })
  street: string;

  @Column({ type: 'varchar', length: 20 })
  number: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  complement: string | null;

  @Column({ type: 'varchar', length: 100 })
  neighborhood: string;

  @Column({ type: 'varchar', length: 100 })
  city: string;

  @Column({ type: 'varchar', length: 2 })
  state: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country: string | null;
}

