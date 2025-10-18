import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AddressEntity } from '../entities/address.entity';

@Injectable()
export class AddressRepository {
  constructor(
    @InjectRepository(AddressEntity)
    private readonly addressRepository: Repository<AddressEntity>,
  ) {}

  async create(addressData: Partial<AddressEntity>): Promise<AddressEntity> {
    const address = this.addressRepository.create(addressData);
    return this.addressRepository.save(address);
  }

  async findById(id: string): Promise<AddressEntity | null> {
    return this.addressRepository.findOne({ where: { id } });
  }

  async findByCustomerId(customerId: string): Promise<AddressEntity | null> {
    return this.addressRepository.findOne({ where: { customerId } });
  }

  async update(id: string, addressData: Partial<AddressEntity>): Promise<AddressEntity | null> {
    await this.addressRepository.update(id, addressData);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.addressRepository.delete(id);
  }
}

