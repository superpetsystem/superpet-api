import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { AddressRepository } from '../repositories/address.repository';
import { CreateAddressDto } from '../dto/create-address.dto';
import { AddressEntity } from '../entities/address.entity';

@Injectable()
export class AddressService {
  constructor(private readonly addressRepository: AddressRepository) {}

  async create(customerId: string, dto: CreateAddressDto): Promise<AddressEntity> {
    // Validar CEP (8 dígitos)
    if (!/^\d{8}$/.test(dto.zip)) {
      throw new BadRequestException('ADDRESS_INVALID');
    }

    // Se isPrimary, desmarcar outros
    if (dto.isPrimary) {
      await this.addressRepository.unsetAllPrimary(customerId);
    }

    // Se é o primeiro endereço, marcar como primário
    const existingAddresses = await this.addressRepository.findByCustomer(customerId);
    const isPrimary = dto.isPrimary !== undefined ? dto.isPrimary : existingAddresses.length === 0;

    return this.addressRepository.create({
      customerId,
      ...dto,
      isPrimary,
      country: dto.country || 'BR',
    });
  }

  async findByCustomer(customerId: string): Promise<AddressEntity[]> {
    return this.addressRepository.findByCustomer(customerId);
  }

  async findById(id: string): Promise<AddressEntity> {
    const address = await this.addressRepository.findById(id);
    if (!address) {
      throw new NotFoundException('NOT_FOUND');
    }
    return address;
  }

  async update(id: string, dto: Partial<AddressEntity>): Promise<AddressEntity> {
    const address = await this.findById(id);

    // Validar CEP se fornecido
    if (dto.zip && !/^\d{8}$/.test(dto.zip)) {
      throw new BadRequestException('ADDRESS_INVALID');
    }

    const updated = await this.addressRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundException('NOT_FOUND');
    }

    return updated;
  }

  async setPrimary(addressId: string, customerId: string): Promise<void> {
    const address = await this.findById(addressId);
    
    if (address.customerId !== customerId) {
      throw new ForbiddenException('Address does not belong to this customer');
    }

    await this.addressRepository.setPrimary(addressId, customerId);
  }

  async ensureOnePrimary(customerId: string): Promise<void> {
    const primary = await this.addressRepository.findPrimaryByCustomer(customerId);
    
    if (!primary) {
      const addresses = await this.addressRepository.findByCustomer(customerId);
      if (addresses.length > 0) {
        await this.addressRepository.setPrimary(addresses[0].id, customerId);
      }
    }
  }
}
