import { Injectable, NotFoundException } from '@nestjs/common';
import { PetsRepository } from '../pets.repository';
import { PetEntity } from '../entities/pet.entity';

@Injectable()
export class PetUpdateService {
  constructor(private readonly petsRepository: PetsRepository) {}

  async update(id: string, petData: Partial<PetEntity>): Promise<PetEntity> {
    const pet = await this.petsRepository.findById(id);
    if (!pet) {
      throw new NotFoundException(`Pet with ID ${id} not found`);
    }

    const updatedPet = await this.petsRepository.update(id, petData);
    if (!updatedPet) {
      throw new NotFoundException(`Pet with ID ${id} not found after update`);
    }
    return updatedPet;
  }
}

