import { Injectable, NotFoundException } from '@nestjs/common';
import { PetsRepository } from '../pets.repository';

@Injectable()
export class PetDeleteService {
  constructor(private readonly petsRepository: PetsRepository) {}

  async delete(id: string): Promise<void> {
    const pet = await this.petsRepository.findById(id);
    if (!pet) {
      throw new NotFoundException(`Pet with ID ${id} not found`);
    }

    await this.petsRepository.delete(id);
  }
}

