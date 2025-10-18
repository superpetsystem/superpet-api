import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PetEntity } from './entities/pet.entity';
import { PetsRepository } from './pets.repository';
import { PetCreateService } from './services/pet-create.service';
import { PetGetService } from './services/pet-get.service';
import { PetUpdateService } from './services/pet-update.service';
import { PetDeleteService } from './services/pet-delete.service';
import { PetsController } from './pets.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PetEntity]),
    AuthModule,
  ],
  controllers: [PetsController],
  providers: [
    PetsRepository,
    PetCreateService,
    PetGetService,
    PetUpdateService,
    PetDeleteService,
  ],
  exports: [
    PetsRepository,
    PetCreateService,
    PetGetService,
    PetUpdateService,
    PetDeleteService,
  ],
})
export class PetsModule {}

