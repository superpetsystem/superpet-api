import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CustomersRepository } from '../customers.repository';
import { CustomerEntity } from '../entities/customer.entity';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { AddressService } from './address.service';
import { PersonDataService } from './person-data.service';

@Injectable()
export class CustomerUpdateService {
  constructor(
    private readonly customersRepository: CustomersRepository,
    private readonly addressService: AddressService,
    private readonly personDataService: PersonDataService,
  ) {}

  async update(
    id: string,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<CustomerEntity> {
    const customer = await this.customersRepository.findById(id);
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    // Separar dados para user
    const userData: any = {};
    if (updateCustomerDto.email) userData.email = updateCustomerDto.email;
    if (updateCustomerDto.name) userData.name = updateCustomerDto.name;
    if (updateCustomerDto.password) {
      userData.password = await bcrypt.hash(updateCustomerDto.password, 10);
    }

    // Dados do customer
    const customerData: any = {};
    if (updateCustomerDto.phone !== undefined) customerData.phone = updateCustomerDto.phone;
    if (updateCustomerDto.notes !== undefined) customerData.notes = updateCustomerDto.notes;
    if (updateCustomerDto.active !== undefined) customerData.active = updateCustomerDto.active;

    // Atualizar customer (user + customer)
    await this.customersRepository.update(id, userData, customerData);

    // Atualizar address se fornecido
    if (updateCustomerDto.address && customer.address) {
      await this.addressService.update(customer.address.id, updateCustomerDto.address);
    }

    // Atualizar personData se fornecido
    if (updateCustomerDto.personData && customer.personData) {
      await this.personDataService.update(customer.personData.id, updateCustomerDto.personData);
    }

    // Retornar customer completo atualizado
    const updatedCustomer = await this.customersRepository.findById(id);
    if (!updatedCustomer) {
      throw new NotFoundException(`Customer with ID ${id} not found after update`);
    }
    return updatedCustomer;
  }
}

