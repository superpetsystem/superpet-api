import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VeterinaryRecordEntity } from './entities/veterinary-record.entity';
import { VaccinationEntity } from './entities/vaccination.entity';
import { VeterinaryRecordRepository } from './repositories/veterinary-record.repository';
import { VaccinationRepository } from './repositories/vaccination.repository';
import { VeterinaryService } from './services/veterinary.service';
import { VeterinaryController } from './veterinary.controller';
import { AuthModule } from '../auth/auth.module';
import { EmployeesModule } from '../employees/employees.module';
import { StoresModule } from '../stores/stores.module';
import { PetsModule } from '../pets/pets.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([VeterinaryRecordEntity, VaccinationEntity]),
    AuthModule,
    EmployeesModule,
    StoresModule,
    PetsModule,
  ],
  controllers: [VeterinaryController],
  providers: [VeterinaryRecordRepository, VaccinationRepository, VeterinaryService],
  exports: [VeterinaryService],
})
export class VeterinaryModule {}

