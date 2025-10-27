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
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../common/guards/role.guard';
import { RoleGuard } from '../../common/guards/role.guard';
import { CustomServiceService } from '../services/custom-service.service';
import { CreateCustomServiceDto } from '../dto/create-custom-service.dto';
import { CustomServiceEntity, CustomServiceState } from '../entities/custom-service.entity';
import { EmployeeRole } from '../../employees/entities/employee.entity';

@Controller('stores/:storeId/custom-services')
@UseGuards(JwtAuthGuard)
export class CustomServicesController {
  constructor(private readonly customServiceService: CustomServiceService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Param('storeId') storeId: string,
    @Query('serviceId') serviceId?: string,
    @Query('state') state?: CustomServiceState,
  ): Promise<CustomServiceEntity[]> {
    const filters: any = {};
    if (serviceId) filters.serviceId = serviceId;
    if (state) filters.state = state;

    return this.customServiceService.findByStore(storeId, filters);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id') id: string): Promise<CustomServiceEntity> {
    return this.customServiceService.findById(id);
  }

  @Post()
  @Roles(EmployeeRole.OWNER, EmployeeRole.ADMIN)
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('storeId') storeId: string,
    @Body() dto: CreateCustomServiceDto,
  ): Promise<CustomServiceEntity> {
    return this.customServiceService.create(storeId, dto);
  }

  @Put(':id')
  @Roles(EmployeeRole.OWNER, EmployeeRole.ADMIN)
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<CustomServiceEntity>,
  ): Promise<CustomServiceEntity> {
    return this.customServiceService.update(id, dto);
  }

  @Post(':id/publish')
  @Roles(EmployeeRole.OWNER, EmployeeRole.ADMIN)
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  async publish(@Param('id') id: string): Promise<CustomServiceEntity> {
    return this.customServiceService.publish(id);
  }

  @Post(':id/archive')
  @Roles(EmployeeRole.OWNER, EmployeeRole.ADMIN)
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  async archive(@Param('id') id: string): Promise<CustomServiceEntity> {
    return this.customServiceService.archive(id);
  }

  @Delete(':id')
  @Roles(EmployeeRole.OWNER, EmployeeRole.ADMIN)
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    return this.customServiceService.delete(id);
  }
}


