import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CustomerCreateService } from './services/customer-create.service';
import { CustomerGetService } from './services/customer-get.service';
import { CustomerUpdateService } from './services/customer-update.service';
import { CustomerDeleteService } from './services/customer-delete.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerEntity } from './entities/customer.entity';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';

@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomersController {
  constructor(
    private readonly customerCreateService: CustomerCreateService,
    private readonly customerGetService: CustomerGetService,
    private readonly customerUpdateService: CustomerUpdateService,
    private readonly customerDeleteService: CustomerDeleteService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCustomerDto: CreateCustomerDto): Promise<CustomerEntity> {
    return this.customerCreateService.create(createCustomerDto);
  }

  @Get('all')
  @HttpCode(HttpStatus.OK)
  async findAllSimple(): Promise<CustomerEntity[]> {
    return this.customerGetService.findAllSimple();
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() paginationDto: PaginationDto): Promise<PaginatedResult<CustomerEntity>> {
    return this.customerGetService.findAll(paginationDto.page, paginationDto.limit);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id') id: string): Promise<CustomerEntity> {
    return this.customerGetService.findById(id);
  }

  @Get('email/:email')
  @HttpCode(HttpStatus.OK)
  async findByEmail(@Param('email') email: string): Promise<CustomerEntity> {
    return this.customerGetService.findByEmail(email);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ): Promise<CustomerEntity> {
    return this.customerUpdateService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    return this.customerDeleteService.delete(id);
  }
}

