import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { OrganizationEntity } from '../../organizations/entities/organization.entity';
import { StoreEntity } from '../../stores/entities/store.entity';
import { CustomerEntity } from '../../customers/entities/customer.entity';
import { PetEntity } from '../../pets/entities/pet.entity';
import { ServiceEntity } from '../../services/entities/service.entity';
import { EmployeeEntity } from '../../employees/entities/employee.entity';

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

@Entity('bookings')
@Index('IDX_BOOKING_STORE_DATE', ['storeId', 'bookingDate'])
@Index('IDX_BOOKING_CUSTOMER', ['customerId'])
@Index('IDX_BOOKING_EMPLOYEE', ['employeeId', 'bookingDate'])
export class BookingEntity extends BaseEntity {
  @Column({ name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => OrganizationEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'organization_id' })
  organization: OrganizationEntity;

  @Column({ name: 'store_id' })
  storeId: string;

  @ManyToOne(() => StoreEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity;

  @Column({ name: 'customer_id' })
  customerId: string;

  @ManyToOne(() => CustomerEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'customer_id' })
  customer: CustomerEntity;

  @Column({ name: 'pet_id', nullable: true })
  petId: string | null;

  @ManyToOne(() => PetEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'pet_id' })
  pet: PetEntity;

  @Column({ name: 'service_id' })
  serviceId: string;

  @ManyToOne(() => ServiceEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'service_id' })
  service: ServiceEntity;

  @Column({ name: 'employee_id', nullable: true })
  employeeId: string | null;

  @ManyToOne(() => EmployeeEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'employee_id' })
  employee: EmployeeEntity;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @Column({ name: 'booking_date', type: 'date' })
  bookingDate: Date;

  @Column({ name: 'start_time', type: 'time' })
  startTime: string;

  @Column({ name: 'end_time', type: 'time' })
  endTime: string;

  @Column({ name: 'price_cents', type: 'int' })
  priceCents: number;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'cancellation_reason', type: 'text', nullable: true })
  cancellationReason: string | null;

  @Column({ name: 'confirmed_at', type: 'timestamp', nullable: true })
  confirmedAt: Date | null;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date | null;
}

