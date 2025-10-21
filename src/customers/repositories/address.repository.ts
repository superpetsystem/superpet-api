import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AddressEntity } from '../entities/address.entity';

@Injectable()
export class AddressRepository {
  constructor(
    @InjectRepository(AddressEntity)
    private readonly repository: Repository<AddressEntity>,
  ) {}

  async create(data: Partial<AddressEntity>): Promise<AddressEntity> {
    const address = this.repository.create(data);
    return this.repository.save(address);
  }

  async findById(id: string): Promise<AddressEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByCustomer(customerId: string): Promise<AddressEntity[]> {
    return this.repository.find({
      where: { customerId },
      order: { isPrimary: 'DESC', createdAt: 'DESC' },
    });
  }

  async findPrimaryByCustomer(customerId: string): Promise<AddressEntity | null> {
    return this.repository.findOne({
      where: { customerId, isPrimary: true },
    });
  }

  async unsetAllPrimary(customerId: string): Promise<void> {
    await this.repository.update(
      { customerId },
      { isPrimary: false },
    );
  }

  async setPrimary(id: string, customerId: string): Promise<void> {
    // Desmarcar todos
    await this.unsetAllPrimary(customerId);
    // Marcar o escolhido
    await this.repository.update(id, { isPrimary: true });
  }

  async update(id: string, data: Partial<AddressEntity>): Promise<AddressEntity | null> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
