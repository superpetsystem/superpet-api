import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PersonDataEntity } from '../entities/person-data.entity';

@Injectable()
export class PersonDataRepository {
  constructor(
    @InjectRepository(PersonDataEntity)
    private readonly repository: Repository<PersonDataEntity>,
  ) {}

  async create(data: Partial<PersonDataEntity>): Promise<PersonDataEntity> {
    const personData = this.repository.create(data);
    return this.repository.save(personData);
  }

  async findByCustomerId(customerId: string): Promise<PersonDataEntity | null> {
    return this.repository.findOne({ where: { customerId } });
  }

  async checkCpfExists(cpf: string, excludeCustomerId?: string): Promise<boolean> {
    const query = this.repository.createQueryBuilder('pd')
      .innerJoin('pd.customer', 'customer')
      .where('pd.cpf = :cpf', { cpf })
      .andWhere('customer.deleted_at IS NULL');

    if (excludeCustomerId) {
      query.andWhere('pd.customer_id != :excludeCustomerId', { excludeCustomerId });
    }

    const count = await query.getCount();
    return count > 0;
  }

  async update(customerId: string, data: Partial<PersonDataEntity>): Promise<PersonDataEntity | null> {
    await this.repository.update({ customerId }, data);
    return this.findByCustomerId(customerId);
  }
}
