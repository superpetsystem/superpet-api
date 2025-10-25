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
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/guards/role.guard';
import { RoleGuard } from '../common/guards/role.guard';
import { ServiceService } from './services/service.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { ServiceEntity, ServiceVisibility } from './entities/service.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { EmployeeRole } from '../employees/entities/employee.entity';

@Controller('services')
@UseGuards(JwtAuthGuard)
export class ServicesController {
  constructor(private readonly serviceService: ServiceService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @CurrentUser() user: any,
    @Query('query') query?: string,
    @Query('active') active?: string,
    @Query('visibility') visibility?: ServiceVisibility,
  ): Promise<ServiceEntity[]> {
    const filters: any = {};
    if (query) filters.query = query;
    if (active !== undefined) filters.active = active === 'true';
    if (visibility) filters.visibility = visibility;

    return this.serviceService.findByOrganization(user.organizationId, filters);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id') id: string): Promise<ServiceEntity> {
    return this.serviceService.findById(id);
  }

  @Post()
  @Roles(EmployeeRole.OWNER, EmployeeRole.ADMIN)
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: any,
    @Body() dto: CreateServiceDto,
  ): Promise<ServiceEntity> {
    return this.serviceService.create(user.organizationId, dto);
  }

  @Put(':id')
  @Roles(EmployeeRole.OWNER, EmployeeRole.ADMIN)
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<ServiceEntity>,
  ): Promise<ServiceEntity> {
    return this.serviceService.update(id, dto);
  }

  @Patch(':id/status')
  @Roles(EmployeeRole.OWNER, EmployeeRole.ADMIN)
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @Param('id') id: string,
    @Body('active') active: boolean,
  ): Promise<ServiceEntity> {
    return this.serviceService.updateStatus(id, active);
  }

  @Put(':id/addons')
  @Roles(EmployeeRole.OWNER, EmployeeRole.ADMIN)
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  async updateAddons(
    @Param('id') id: string,
    @Body('addons') addons: string[],
  ): Promise<ServiceEntity> {
    return this.serviceService.updateAddons(id, addons);
  }
}
