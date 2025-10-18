import { Injectable, NotFoundException } from '@nestjs/common';
import { CustomersRepository } from '../customers.repository';

@Injectable()
export class CustomerDeleteService {
  constructor(private readonly customersRepository: CustomersRepository) {}

  async delete(id: string): Promise<void> {
    const customer = await this.customersRepository.findById(id);
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    await this.customersRepository.delete(id);
  }
}

