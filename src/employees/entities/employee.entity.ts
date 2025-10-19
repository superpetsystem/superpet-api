import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { OrganizationEntity } from '../../organizations/entities/organization.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { EmployeeStoreEntity } from './employee-store.entity';

export enum EmployeeRole {
  OWNER = 'OWNER',             // Dono da loja, pode criar ADMIN, STAFF, VIEWER
  ADMIN = 'ADMIN',             // Gerente da loja, pode criar STAFF, VIEWER
  STAFF = 'STAFF',             // Funcionário com acesso limitado
  VIEWER = 'VIEWER',           // Apenas visualização
}

// Tipos de cargo/função dos funcionários
export enum JobTitle {
  // Gestão
  OWNER = 'OWNER',
  MANAGER = 'MANAGER',
  
  // Atendimento
  RECEPTIONIST = 'RECEPTIONIST',
  CUSTOMER_SERVICE = 'CUSTOMER_SERVICE',
  
  // Veterinários
  VETERINARIAN = 'VETERINARIAN',
  VET_ASSISTANT = 'VET_ASSISTANT',
  
  // Grooming/Estética
  GROOMER = 'GROOMER',
  GROOMER_ASSISTANT = 'GROOMER_ASSISTANT',
  BATHER = 'BATHER',
  
  // Pet Hotel/Daycare
  PET_HANDLER = 'PET_HANDLER',
  DAYCARE_MONITOR = 'DAYCARE_MONITOR',
  
  // Operacional
  JANITOR = 'JANITOR',
  STOCK_MANAGER = 'STOCK_MANAGER',
  DELIVERY_DRIVER = 'DELIVERY_DRIVER',
  
  // Outros
  TRAINER = 'TRAINER',
  NUTRITIONIST = 'NUTRITIONIST',
  OTHER = 'OTHER',
}

export interface WorkSchedule {
  mon?: string[][];
  tue?: string[][];
  wed?: string[][];
  thu?: string[][];
  fri?: string[][];
  sat?: string[][];
  sun?: string[][];
}

@Entity('employees')
export class EmployeeEntity extends BaseEntity {
  @Column({ name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => OrganizationEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'organization_id' })
  organization: OrganizationEntity;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({
    type: 'enum',
    enum: EmployeeRole,
    default: EmployeeRole.STAFF,
  })
  role: EmployeeRole;

  @Column({
    name: 'job_title',
    type: 'enum',
    enum: JobTitle,
    nullable: true,
  })
  jobTitle?: JobTitle;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @Column({ name: 'work_schedule', type: 'json', nullable: true })
  workSchedule: WorkSchedule | null;

  @OneToMany(() => EmployeeStoreEntity, (es) => es.employee)
  employeeStores: EmployeeStoreEntity[];
}
