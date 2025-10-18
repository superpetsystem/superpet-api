import { Injectable, NotFoundException } from '@nestjs/common';
import { CustomersRepository } from '../customers.repository';
import { CustomerEntity } from '../entities/customer.entity';
import { PaginatedResult } from '../../common/dto/pagination.dto';

@Injectable()
export class CustomerGetService {
  constructor(private readonly customersRepository: CustomersRepository) {}

  async findById(id: string): Promise<CustomerEntity> {
    const customer = await this.customersRepository.findById(id);
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    return customer;
  }

  async findByEmail(email: string): Promise<CustomerEntity> {
    const customer = await this.customersRepository.findByEmail(email);
    if (!customer) {
      throw new NotFoundException(`Customer with email ${email} not found`);
    }
    return customer;
  }

  async findAll(page: number = 1, limit: number = 10): Promise<PaginatedResult<CustomerEntity>> {
    return this.customersRepository.findAll(page, limit);
  }

  async findAllSimple(): Promise<CustomerEntity[]> {
    return this.customersRepository.findAllSimple();
  }
}

