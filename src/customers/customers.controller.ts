import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CustomerService } from './services/customer.service';
import { AddressService } from './services/address.service';
import { PersonDataService } from './services/person-data.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { CreatePersonDataDto } from './dto/create-person-data.dto';
import { CustomerEntity, CustomerStatus } from './entities/customer.entity';
import { AddressEntity } from './entities/address.entity';
import { PersonDataEntity } from './entities/person-data.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../common/guards/role.guard';
import { RoleGuard } from '../common/guards/role.guard';
import { EmployeeRole } from '../employees/entities/employee.entity';

@Controller('v1/customers')
@UseGuards(JwtAuthGuard)
export class CustomersController {
  private readonly logger = new Logger(CustomersController.name);

  constructor(
    private readonly customerService: CustomerService,
    private readonly addressService: AddressService,
    private readonly personDataService: PersonDataService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @CurrentUser() user: any,
    @Query('query') query?: string,
    @Query('status') status?: CustomerStatus,
  ): Promise<CustomerEntity[]> {
    this.logger.log(`📋 List customers - OrgID: ${user.organizationId}, Filters: ${JSON.stringify({ query, status })}`);
    
    try {
      const filters: any = {};
      if (query) filters.query = query;
      if (status) filters.status = status;

      const customers = await this.customerService.findByOrganization(user.organizationId, filters);
      this.logger.log(`✅ Found ${customers.length} customers - OrgID: ${user.organizationId}`);
      
      return customers;
    } catch (error) {
      this.logger.error(`❌ List customers failed - OrgID: ${user.organizationId}, Error: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findById(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ): Promise<CustomerEntity> {
    this.logger.log(`🔍 Get customer - ID: ${id}, OrgID: ${user.organizationId}`);
    
    try {
      const customer = await this.customerService.findById(id);
      
      // Validar que o customer pertence à mesma organização
      if (!customer || customer.organizationId !== user.organizationId) {
        this.logger.warn(`⚠️  Customer not found or cross-tenant access - ID: ${id}, UserOrg: ${user.organizationId}, CustomerOrg: ${customer?.organizationId || 'null'}`);
        throw new NotFoundException('Customer not found'); // Retornar 404 para não vazar que existe
      }
      
      this.logger.log(`✅ Customer found - ID: ${id}, Name: ${customer.name}`);
      return customer;
    } catch (error) {
      if (error instanceof NotFoundException) {
        this.logger.error(`❌ 404 - Customer not found - ID: ${id}`);
      } else {
        this.logger.error(`❌ Get customer failed - ID: ${id}, Error: ${error.message}`, error.stack);
      }
      throw error;
    }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: any,
    @Body() dto: CreateCustomerDto,
  ): Promise<CustomerEntity> {
    this.logger.log(`📝 Create customer - Email: ${dto.email}, OrgID: ${user.organizationId}`);
    
    try {
      const customer = await this.customerService.create(user.organizationId, dto);
      this.logger.log(`✅ Customer created - ID: ${customer.id}, Name: ${customer.name}`);
      
      return customer;
    } catch (error) {
      if (error.message?.includes('Email already exists') || error.message?.includes('MISSING_CONTACT')) {
        this.logger.error(`❌ 400 - Validation error - ${error.message} - Email: ${dto.email}`);
      } else {
        this.logger.error(`❌ Create customer failed - Email: ${dto.email}, Error: ${error.message}`, error.stack);
      }
      throw error;
    }
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
  ): Promise<CustomerEntity> {
    this.logger.log(`📝 Update customer - ID: ${id}`);
    
    try {
      const customer = await this.customerService.update(id, dto);
      this.logger.log(`✅ Customer updated - ID: ${id}`);
      
      return customer;
    } catch (error) {
      this.logger.error(`❌ Update customer failed - ID: ${id}, Error: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: CustomerStatus,
  ): Promise<CustomerEntity> {
    this.logger.log(`🔄 Update customer status - ID: ${id}, NewStatus: ${status}`);
    
    try {
      const customer = await this.customerService.updateStatus(id, status);
      this.logger.log(`✅ Status updated - ID: ${id}, Status: ${status}`);
      
      return customer;
    } catch (error) {
      this.logger.error(`❌ Update status failed - ID: ${id}, Error: ${error.message}`, error.stack);
      throw error;
    }
  }

  // ===== ADDRESSES =====
  
  @Get(':id/addresses')
  @HttpCode(HttpStatus.OK)
  async findAddresses(@Param('id') customerId: string): Promise<AddressEntity[]> {
    return this.addressService.findByCustomer(customerId);
  }

  @Post(':id/addresses')
  @HttpCode(HttpStatus.CREATED)
  async createAddress(
    @Param('id') customerId: string,
    @Body() dto: CreateAddressDto,
  ): Promise<AddressEntity> {
    return this.addressService.create(customerId, dto);
  }

  @Put(':id/addresses/:addressId')
  @HttpCode(HttpStatus.OK)
  async updateAddress(
    @Param('addressId') addressId: string,
    @Body() dto: Partial<AddressEntity>,
  ): Promise<AddressEntity> {
    return this.addressService.update(addressId, dto);
  }

  @Patch(':id/addresses/:addressId/primary')
  @HttpCode(HttpStatus.NO_CONTENT)
  async setPrimaryAddress(
    @Param('id') customerId: string,
    @Param('addressId') addressId: string,
  ): Promise<void> {
    return this.addressService.setPrimary(addressId, customerId);
  }

  // ===== PERSONAL DATA (OWNER/ADMIN only) =====
  
  @Get(':id/personal-data')
  @Roles(EmployeeRole.OWNER, EmployeeRole.ADMIN)
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  async getPersonalData(@Param('id') customerId: string): Promise<PersonDataEntity | null> {
    return this.personDataService.findByCustomerId(customerId);
  }

  @Put(':id/personal-data')
  @Roles(EmployeeRole.OWNER, EmployeeRole.ADMIN)
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  async updatePersonalData(
    @Param('id') customerId: string,
    @Body() dto: CreatePersonDataDto,
  ): Promise<PersonDataEntity> {
    const updateData: any = {
      cpf: dto.cpf,
      rg: dto.rg,
      issuer: dto.issuer,
      birthdate: dto.birthdate ? new Date(dto.birthdate) : undefined,
      gender: dto.gender,
      guardianName: dto.guardianName,
      guardianPhone: dto.guardianPhone,
      notes: dto.notes,
    };
    return this.personDataService.update(customerId, updateData);
  }
}
