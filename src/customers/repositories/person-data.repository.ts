import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PersonDataEntity } from '../entities/person-data.entity';

@Injectable()
export class PersonDataRepository {
  constructor(
    @InjectRepository(PersonDataEntity)
    private readonly personDataRepository: Repository<PersonDataEntity>,
  ) {}

  async create(personData: Partial<PersonDataEntity>): Promise<PersonDataEntity> {
    const data = this.personDataRepository.create(personData);
    return this.personDataRepository.save(data);
  }

  async findById(id: string): Promise<PersonDataEntity | null> {
    return this.personDataRepository.findOne({ where: { id } });
  }

  async findByCustomerId(customerId: string): Promise<PersonDataEntity | null> {
    return this.personDataRepository.findOne({ where: { customerId } });
  }

  async findByDocumentNumber(documentNumber: string): Promise<PersonDataEntity | null> {
    return this.personDataRepository.findOne({ where: { documentNumber } });
  }

  async update(id: string, personData: Partial<PersonDataEntity>): Promise<PersonDataEntity | null> {
    await this.personDataRepository.update(id, personData);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.personDataRepository.delete(id);
  }
}

