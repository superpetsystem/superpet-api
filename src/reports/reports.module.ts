import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerEntity } from '../customers/entities/customer.entity';
import { PetEntity } from '../pets/entities/pet.entity';
import { StoreEntity } from '../stores/entities/store.entity';
import { ReportsService } from './services/reports.service';
import { ReportsController } from './reports.controller';
import { AuthModule } from '../auth/auth.module';
import { EmployeesModule } from '../employees/employees.module';
import { StoresModule } from '../stores/stores.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CustomerEntity,
      PetEntity,
      StoreEntity,
    ]),
    AuthModule,
    EmployeesModule,
    StoresModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}

