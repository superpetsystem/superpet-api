import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { PetEntity, PetStatus } from '../entities/pet.entity';

@Injectable()
export class PetsRepository {
  constructor(
    @InjectRepository(PetEntity)
    private readonly repository: Repository<PetEntity>,
  ) {}

  async create(data: Partial<PetEntity>): Promise<PetEntity> {
    const pet = this.repository.create(data);
    return this.repository.save(pet);
  }

  async findById(id: string): Promise<PetEntity | null> {
    return this.repository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['customer'],
    });
  }

  async findByCustomer(customerId: string, status?: PetStatus): Promise<PetEntity[]> {
    const where: any = { customerId, deletedAt: IsNull() };
    
    if (status) {
      where.status = status;
    }

    return this.repository.find({ where });
  }

  async findByMicrochip(organizationId: string, microchip: string): Promise<PetEntity | null> {
    return this.repository.findOne({
      where: { organizationId, microchip, deletedAt: IsNull() },
    });
  }

  async checkMicrochipExists(organizationId: string, microchip: string, excludeId?: string): Promise<boolean> {
    const where: any = { organizationId, microchip, deletedAt: IsNull() };
    
    const query = this.repository.createQueryBuilder('pet').where(where);
    
    if (excludeId) {
      query.andWhere('pet.id != :excludeId', { excludeId });
    }

    const count = await query.getCount();
    return count > 0;
  }

  async update(id: string, data: Partial<PetEntity>): Promise<PetEntity | null> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.update(id, { deletedAt: new Date() });
  }
}
