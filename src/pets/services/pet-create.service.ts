import { Injectable, BadRequestException } from '@nestjs/common';
import { PetsRepository } from '../pets.repository';
import { PetEntity } from '../entities/pet.entity';

@Injectable()
export class PetCreateService {
  constructor(private readonly petsRepository: PetsRepository) {}

  async create(petData: Partial<PetEntity>): Promise<PetEntity> {
    try {
      return await this.petsRepository.create(petData);
    } catch (error) {
      throw new BadRequestException('Failed to create pet');
    }
  }
}

