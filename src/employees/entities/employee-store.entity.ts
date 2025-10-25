import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { EmployeeEntity } from './employee.entity';
import { StoreEntity } from '../../stores/entities/store.entity';

@Entity('employee_stores')
export class EmployeeStoreEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'employee_id' })
  employeeId: string;

  @ManyToOne(() => EmployeeEntity, (employee) => employee.employeeStores, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_id' })
  employee: EmployeeEntity;

  @Column({ name: 'store_id' })
  storeId: string;

  @ManyToOne(() => StoreEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}




