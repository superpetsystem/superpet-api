import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationEntity } from './entities/organization.entity';
import { StoreEntity } from '../stores/entities/store.entity';
import { EmployeeEntity } from '../employees/entities/employee.entity';
import { OrganizationsRepository } from './organizations.repository';
import { PlanLimitsService } from './services/plan-limits.service';

@Module({
  imports: [TypeOrmModule.forFeature([OrganizationEntity, StoreEntity, EmployeeEntity])],
  controllers: [],
  providers: [OrganizationsRepository, PlanLimitsService],
  exports: [OrganizationsRepository, PlanLimitsService],
})
export class OrganizationsModule {}


