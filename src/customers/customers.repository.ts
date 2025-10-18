import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerEntity } from './entities/customer.entity';
import { UserEntity, UserRole } from '../users/entities/user.entity';
import { PaginatedResult } from '../common/dto/pagination.dto';

@Injectable()
export class CustomersRepository {
  constructor(
    @InjectRepository(CustomerEntity)
    private readonly customerRepository: Repository<CustomerEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async create(
    userData: Partial<UserEntity>,
    customerData: Partial<CustomerEntity>,
  ): Promise<CustomerEntity> {
    // Criar usuário
    const user = this.userRepository.create({
      ...userData,
      role: UserRole.CUSTOMER,
    });
    const savedUser = await this.userRepository.save(user);

    // Criar customer
    const customer = this.customerRepository.create({
      ...customerData,
      userId: savedUser.id,
    });
    const savedCustomer = await this.customerRepository.save(customer);

    // Retornar customer
    return savedCustomer;
  }

  async findById(id: string): Promise<CustomerEntity | null> {
    return this.customerRepository.findOne({
      where: { id },
      relations: ['user', 'address', 'personData'],
    });
  }

  async findByUserId(userId: string): Promise<CustomerEntity | null> {
    return this.customerRepository.findOne({
      where: { userId },
      relations: ['user', 'address', 'personData'],
    });
  }

  async findByEmail(email: string): Promise<CustomerEntity | null> {
    const user = await this.userRepository.findOne({
      where: { email, role: UserRole.CUSTOMER },
    });

    if (!user) {
      return null;
    }

    return this.findByUserId(user.id);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResult<CustomerEntity>> {
    const skip = (page - 1) * limit;

    const [data, total] = await this.customerRepository.findAndCount({
      relations: ['user', 'address', 'personData'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findAllSimple(): Promise<CustomerEntity[]> {
    return this.customerRepository.find({
      relations: ['user', 'address', 'personData'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    id: string,
    userData: Partial<UserEntity>,
    customerData: Partial<CustomerEntity>,
  ): Promise<CustomerEntity | null> {
    const customer = await this.findById(id);

    if (!customer) {
      return null;
    }

    // Atualizar user
    if (Object.keys(userData).length > 0) {
      await this.userRepository.update(customer.userId, userData);
    }

    // Atualizar customer
    if (Object.keys(customerData).length > 0) {
      await this.customerRepository.update(id, customerData);
    }

    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    const customer = await this.findById(id);
    if (customer) {
      // Deletar user (cascade vai deletar customer, address e personData)
      await this.userRepository.delete(customer.userId);
    }
  }

  async save(customer: CustomerEntity): Promise<CustomerEntity> {
    return this.customerRepository.save(customer);
  }
}

