import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VaccinationEntity } from '../entities/vaccination.entity';

@Injectable()
export class VaccinationRepository {
  constructor(
    @InjectRepository(VaccinationEntity)
    private readonly repository: Repository<VaccinationEntity>,
  ) {}

  async create(data: Partial<VaccinationEntity>): Promise<VaccinationEntity> {
    const vaccination = this.repository.create(data);
    return this.repository.save(vaccination);
  }

  async findById(id: string): Promise<VaccinationEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['pet', 'veterinarian'],
    });
  }

  async findByPet(petId: string): Promise<VaccinationEntity[]> {
    return this.repository.find({
      where: { petId },
      relations: ['veterinarian'],
      order: { applicationDate: 'DESC' },
    });
  }

  async getUpcoming(petId: string): Promise<VaccinationEntity[]> {
    const today = new Date();
    return this.repository
      .createQueryBuilder('vaccination')
      .where('vaccination.petId = :petId', { petId })
      .andWhere('vaccination.nextDoseDate >= :today', { today })
      .orderBy('vaccination.nextDoseDate', 'ASC')
      .getMany();
  }
}

