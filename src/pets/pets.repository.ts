import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PetEntity } from './entities/pet.entity';
import { PaginatedResult } from '../common/dto/pagination.dto';

@Injectable()
export class PetsRepository {
  constructor(
    @InjectRepository(PetEntity)
    private readonly petRepository: Repository<PetEntity>,
  ) {}

  async create(petData: Partial<PetEntity>): Promise<PetEntity> {
    const pet = this.petRepository.create(petData);
    return this.petRepository.save(pet);
  }

  async findById(id: string): Promise<PetEntity | null> {
    return this.petRepository.findOne({
      where: { id },
      relations: ['customer', 'customer.user', 'customer.address', 'customer.personData'],
    });
  }

  async findByCustomerId(customerId: string): Promise<PetEntity[]> {
    return this.petRepository.find({
      where: { customerId },
      relations: ['customer', 'customer.user', 'customer.address', 'customer.personData'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResult<PetEntity>> {
    const skip = (page - 1) * limit;

    const [data, total] = await this.petRepository.findAndCount({
      relations: ['customer', 'customer.user', 'customer.address', 'customer.personData'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findAllSimple(): Promise<PetEntity[]> {
    return this.petRepository.find({
      relations: ['customer', 'customer.user', 'customer.address', 'customer.personData'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, petData: Partial<PetEntity>): Promise<PetEntity | null> {
    await this.petRepository.update(id, petData);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.petRepository.delete(id);
  }

  async save(pet: PetEntity): Promise<PetEntity> {
    return this.petRepository.save(pet);
  }
}

