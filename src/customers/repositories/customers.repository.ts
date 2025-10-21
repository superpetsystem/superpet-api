import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Like } from 'typeorm';
import { CustomerEntity, CustomerStatus } from '../entities/customer.entity';

@Injectable()
export class CustomersRepository {
  constructor(
    @InjectRepository(CustomerEntity)
    private readonly repository: Repository<CustomerEntity>,
  ) {}

  async create(data: Partial<CustomerEntity>): Promise<CustomerEntity> {
    const customer = this.repository.create(data);
    return this.repository.save(customer);
  }

  async findById(id: string): Promise<CustomerEntity | null> {
    return this.repository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['user', 'addresses', 'personData'],
    });
  }

  async findByOrganization(
    organizationId: string,
    filters?: { query?: string; status?: CustomerStatus },
  ): Promise<CustomerEntity[]> {
    const where: any = { organizationId, deletedAt: IsNull() };

    if (filters?.status) {
      where.status = filters.status;
    }

    const query = this.repository
      .createQueryBuilder('customer')
      .leftJoinAndSelect('customer.addresses', 'addresses')
      .where(where);

    if (filters?.query) {
      query.andWhere(
        '(customer.name LIKE :query OR customer.email LIKE :query OR customer.phone LIKE :query)',
        { query: `%${filters.query}%` },
      );
    }

    return query.getMany();
  }

  async findByEmail(organizationId: string, email: string): Promise<CustomerEntity | null> {
    return this.repository.findOne({
      where: { organizationId, email, deletedAt: IsNull() },
    });
  }

  async checkEmailExists(organizationId: string, email: string, excludeId?: string): Promise<boolean> {
    const where: any = { organizationId, email, deletedAt: IsNull() };
    
    const query = this.repository.createQueryBuilder('customer').where(where);
    
    if (excludeId) {
      query.andWhere('customer.id != :excludeId', { excludeId });
    }

    const count = await query.getCount();
    return count > 0;
  }

  async update(id: string, data: Partial<CustomerEntity>): Promise<CustomerEntity | null> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.update(id, { deletedAt: new Date() });
  }
}
