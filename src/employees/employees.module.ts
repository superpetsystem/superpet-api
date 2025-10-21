import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeEntity } from './entities/employee.entity';
import { EmployeeStoreEntity } from './entities/employee-store.entity';
import { EmployeesRepository } from './repositories/employees.repository';
import { EmployeeService } from './services/employee.service';
import { EmployeesController } from './employees.controller';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { OrganizationsModule } from '../organizations/organizations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmployeeEntity, EmployeeStoreEntity]),
    UsersModule,
    forwardRef(() => AuthModule),
    OrganizationsModule,
  ],
  controllers: [EmployeesController],
  providers: [EmployeesRepository, EmployeeService],
  exports: [EmployeesRepository, EmployeeService],
})
export class EmployeesModule {}
