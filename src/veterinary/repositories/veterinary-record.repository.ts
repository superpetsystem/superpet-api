import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VeterinaryRecordEntity } from '../entities/veterinary-record.entity';

@Injectable()
export class VeterinaryRecordRepository {
  constructor(
    @InjectRepository(VeterinaryRecordEntity)
    private readonly repository: Repository<VeterinaryRecordEntity>,
  ) {}

  async create(data: Partial<VeterinaryRecordEntity>): Promise<VeterinaryRecordEntity> {
    const record = this.repository.create(data);
    return this.repository.save(record);
  }

  async findById(id: string): Promise<VeterinaryRecordEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['pet', 'pet.customer', 'veterinarian', 'store'],
    });
  }

  async findByPet(petId: string, organizationId: string): Promise<VeterinaryRecordEntity[]> {
    return this.repository.find({
      where: { petId, organizationId },
      relations: ['veterinarian', 'store'],
      order: { visitDate: 'DESC' },
    });
  }

  async findByOrganization(organizationId: string): Promise<VeterinaryRecordEntity[]> {
    return this.repository.find({
      where: { organizationId },
      relations: ['pet', 'pet.customer', 'veterinarian'],
      order: { visitDate: 'DESC' },
      take: 100,
    });
  }

  async update(id: string, data: Partial<VeterinaryRecordEntity>): Promise<VeterinaryRecordEntity | null> {
    await this.repository.update(id, data);
    return this.findById(id);
  }
}

