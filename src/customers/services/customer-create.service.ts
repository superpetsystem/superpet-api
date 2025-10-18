import { Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CustomersRepository } from '../customers.repository';
import { CustomerEntity } from '../entities/customer.entity';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { AddressService } from './address.service';
import { PersonDataService } from './person-data.service';

@Injectable()
export class CustomerCreateService {
  constructor(
    private readonly customersRepository: CustomersRepository,
    private readonly addressService: AddressService,
    private readonly personDataService: PersonDataService,
  ) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<CustomerEntity> {
    // Check if customer already exists
    const existingCustomer = await this.customersRepository.findByEmail(
      createCustomerDto.email,
    );

    if (existingCustomer) {
      throw new BadRequestException('Customer with this email already exists');
    }

    try {
      // Hash da senha antes de salvar
      const hashedPassword = await bcrypt.hash(createCustomerDto.password, 10);

      // Separar dados para user
      const userData = {
        email: createCustomerDto.email,
        password: hashedPassword,
        name: createCustomerDto.name,
      };

      // Dados do customer
      const customerData = {
        phone: createCustomerDto.phone,
        notes: createCustomerDto.notes,
      };

      // Criar customer (user + customer)
      const customer = await this.customersRepository.create(
        userData,
        customerData,
      );

      // Criar address
      await this.addressService.create(customer.id, createCustomerDto.address);

      // Criar personData
      await this.personDataService.create(customer.id, createCustomerDto.personData);

      // Retornar customer completo
      const customerComplete = await this.customersRepository.findById(customer.id);
      if (!customerComplete) {
        throw new BadRequestException('Failed to retrieve created customer');
      }
      return customerComplete;
    } catch (error) {
      throw new BadRequestException('Failed to create customer: ' + error.message);
    }
  }
}

