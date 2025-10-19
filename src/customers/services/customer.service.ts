import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { CustomersRepository } from '../repositories/customers.repository';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { CustomerEntity, CustomerStatus } from '../entities/customer.entity';

@Injectable()
export class CustomerService {
  private readonly logger = new Logger(CustomerService.name);
  
  constructor(private readonly customersRepository: CustomersRepository) {}

  async create(organizationId: string, dto: CreateCustomerDto): Promise<CustomerEntity> {
    this.logger.log(`🔍 [BUSINESS RULE] Validating customer creation - Email: ${dto.email}, Phone: ${dto.phone}, OrgID: ${organizationId}`);
    
    // Validar ≥1 contato
    if (!dto.email && !dto.phone) {
      this.logger.error(`❌ [BUSINESS RULE] MISSING_CONTACT - At least one contact required - Name: ${dto.name}`);
      throw new BadRequestException('MISSING_CONTACT: At least one contact method required (email or phone)');
    }

    // Validar email único (se fornecido)
    if (dto.email) {
      const emailExists = await this.customersRepository.checkEmailExists(organizationId, dto.email);
      if (emailExists) {
        this.logger.error(`❌ [BUSINESS RULE] CUSTOMER_EMAIL_TAKEN - Email: ${dto.email}, OrgID: ${organizationId}`);
        throw new BadRequestException('CUSTOMER_EMAIL_TAKEN: Email already registered for another customer');
      }
    }
    
    this.logger.log(`✅ [BUSINESS RULE] Customer validation passed - Email: ${dto.email}`);

    // Processar marketingConsent
    const marketingConsent = dto.marketingConsent
      ? {
          email: dto.marketingConsent.email
            ? { accepted: true, consentAt: new Date().toISOString() }
            : { accepted: false, consentAt: null },
          sms: dto.marketingConsent.sms
            ? { accepted: true, consentAt: new Date().toISOString() }
            : { accepted: false, consentAt: null },
          whatsapp: dto.marketingConsent.whatsapp
            ? { accepted: true, consentAt: new Date().toISOString() }
            : { accepted: false, consentAt: null },
        }
      : null;

    return this.customersRepository.create({
      organizationId,
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      status: CustomerStatus.ACTIVE,
      marketingConsent,
      source: dto.source,
    });
  }

  async findById(id: string): Promise<CustomerEntity> {
    const customer = await this.customersRepository.findById(id);
    if (!customer) {
      throw new NotFoundException('NOT_FOUND');
    }
    return customer;
  }

  async findByOrganization(organizationId: string, filters?: any): Promise<CustomerEntity[]> {
    return this.customersRepository.findByOrganization(organizationId, filters);
  }

  async update(id: string, dto: UpdateCustomerDto): Promise<CustomerEntity> {
    const customer = await this.findById(id);

    // Validar ≥1 contato
    const willHaveEmail = dto.email !== undefined ? dto.email : customer.email;
    const willHavePhone = dto.phone !== undefined ? dto.phone : customer.phone;

    if (!willHaveEmail && !willHavePhone) {
      throw new BadRequestException('MISSING_CONTACT');
    }

    // Validar email único (se alterado)
    if (dto.email && dto.email !== customer.email) {
      const emailExists = await this.customersRepository.checkEmailExists(
        customer.organizationId,
        dto.email,
        id,
      );
      if (emailExists) {
        throw new BadRequestException('CUSTOMER_EMAIL_TAKEN');
      }
    }

    const updateData: Partial<CustomerEntity> = {};
    if (dto.name) updateData.name = dto.name;
    if (dto.email !== undefined) updateData.email = dto.email;
    if (dto.phone !== undefined) updateData.phone = dto.phone;
    
    // Processar marketingConsent se fornecido
    if (dto.marketingConsent) {
      updateData.marketingConsent = {
        email: dto.marketingConsent.email
          ? { accepted: true, consentAt: new Date().toISOString() }
          : customer.marketingConsent?.email || { accepted: false, consentAt: null },
        sms: dto.marketingConsent.sms
          ? { accepted: true, consentAt: new Date().toISOString() }
          : customer.marketingConsent?.sms || { accepted: false, consentAt: null },
        whatsapp: dto.marketingConsent.whatsapp
          ? { accepted: true, consentAt: new Date().toISOString() }
          : customer.marketingConsent?.whatsapp || { accepted: false, consentAt: null },
      };
    }

    const updated = await this.customersRepository.update(id, updateData);
    if (!updated) {
      throw new NotFoundException('NOT_FOUND');
    }

    return updated;
  }

  async updateStatus(id: string, status: CustomerStatus): Promise<CustomerEntity> {
    const updated = await this.customersRepository.update(id, { status });
    if (!updated) {
      throw new NotFoundException('NOT_FOUND');
    }
    return updated;
  }
}

