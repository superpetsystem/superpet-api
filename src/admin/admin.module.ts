import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AuthModule } from '../auth/auth.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { UsersModule } from '../users/users.module';
import { EmployeesModule } from '../employees/employees.module';
import { StoresModule } from '../stores/stores.module';
import { FeatureEntity } from '../stores/entities/feature.entity';
import { StoreFeatureEntity } from '../stores/entities/store-feature.entity';
import { StoreFeatureRepository } from '../stores/repositories/store-feature.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([FeatureEntity, StoreFeatureEntity]),
    AuthModule,
    OrganizationsModule,
    UsersModule,
    EmployeesModule,
    StoresModule,
  ],
  controllers: [AdminController],
  providers: [StoreFeatureRepository],
})
export class AdminModule {}

