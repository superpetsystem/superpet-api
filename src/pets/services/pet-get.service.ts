import { Injectable, NotFoundException } from '@nestjs/common';
import { PetsRepository } from '../pets.repository';
import { PetEntity } from '../entities/pet.entity';
import { PaginatedResult } from '../../common/dto/pagination.dto';

@Injectable()
export class PetGetService {
  constructor(private readonly petsRepository: PetsRepository) {}

  async findById(id: string): Promise<PetEntity> {
    const pet = await this.petsRepository.findById(id);
    if (!pet) {
      throw new NotFoundException(`Pet with ID ${id} not found`);
    }
    return pet;
  }

  async findByCustomerId(customerId: string): Promise<PetEntity[]> {
    return this.petsRepository.findByCustomerId(customerId);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<PaginatedResult<PetEntity>> {
    return this.petsRepository.findAll(page, limit);
  }

  async findAllSimple(): Promise<PetEntity[]> {
    return this.petsRepository.findAllSimple();
  }
}

