import { Entity, Column, ManyToOne, OneToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { OrganizationEntity } from '../../organizations/entities/organization.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { AddressEntity } from './address.entity';
import { PersonDataEntity } from './person-data.entity';

export enum CustomerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum CustomerSource {
  PDV = 'PDV',
  Portal = 'Portal',
  Import = 'Import',
  Other = 'Other',
}

export interface MarketingConsent {
  email?: { accepted: boolean; consentAt: string | null };
  sms?: { accepted: boolean; consentAt: string | null };
  whatsapp?: { accepted: boolean; consentAt: string | null };
}

@Entity('customers')
export class CustomerEntity extends BaseEntity {
  @Column({ name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => OrganizationEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'organization_id' })
  organization: OrganizationEntity;

  @Column({ name: 'user_id', nullable: true })
  userId: string | null;

  @OneToOne(() => UserEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity | null;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({
    type: 'enum',
    enum: CustomerStatus,
    default: CustomerStatus.ACTIVE,
  })
  status: CustomerStatus;

  @Column({ name: 'marketing_consent', type: 'json', nullable: true })
  marketingConsent: MarketingConsent | null;

  @Column({
    type: 'enum',
    enum: CustomerSource,
    default: CustomerSource.PDV,
  })
  source: CustomerSource;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  @OneToMany(() => AddressEntity, (address) => address.customer, { eager: true })
  addresses: AddressEntity[];

  @OneToOne(() => PersonDataEntity, (personData) => personData.customer)
  personData: PersonDataEntity;
}
