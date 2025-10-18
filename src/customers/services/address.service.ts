import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { AddressRepository } from '../repositories/address.repository';
import { AddressEntity } from '../entities/address.entity';
import { CreateAddressDto } from '../dto/create-address.dto';
import { UpdateAddressDto } from '../dto/update-address.dto';

@Injectable()
export class AddressService {
  constructor(private readonly addressRepository: AddressRepository) {}

  async create(customerId: string, createAddressDto: CreateAddressDto): Promise<AddressEntity> {
    try {
      return await this.addressRepository.create({
        ...createAddressDto,
        customerId,
      });
    } catch (error) {
      throw new BadRequestException('Failed to create address');
    }
  }

  async findByCustomerId(customerId: string): Promise<AddressEntity> {
    const address = await this.addressRepository.findByCustomerId(customerId);
    if (!address) {
      throw new NotFoundException(`Address for customer ${customerId} not found`);
    }
    return address;
  }

  async update(id: string, updateAddressDto: UpdateAddressDto): Promise<AddressEntity> {
    const address = await this.addressRepository.findById(id);
    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }

    const updatedAddress = await this.addressRepository.update(id, updateAddressDto);
    if (!updatedAddress) {
      throw new NotFoundException(`Address with ID ${id} not found after update`);
    }
    return updatedAddress;
  }

  async delete(id: string): Promise<void> {
    const address = await this.addressRepository.findById(id);
    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }

    await this.addressRepository.delete(id);
  }
}

