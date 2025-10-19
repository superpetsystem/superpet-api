import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PetEntity } from './entities/pet.entity';
import { PetsRepository } from './repositories/pets.repository';
import { PetService } from './services/pet.service';
import { PetsController } from './pets.controller';
import { CustomersModule } from '../customers/customers.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PetEntity]),
    CustomersModule,
    AuthModule,
  ],
  controllers: [PetsController],
  providers: [PetsRepository, PetService],
  exports: [PetsRepository, PetService],
})
export class PetsModule {}
