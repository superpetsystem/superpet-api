import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  Headers,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/guards/role.guard';
import { RoleGuard } from '../common/guards/role.guard';
import { EmployeeService } from './services/employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { EmployeeEntity, EmployeeRole, JobTitle } from './entities/employee.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('v1/employees')
@UseGuards(JwtAuthGuard)
export class EmployeesController {
  constructor(private readonly employeeService: EmployeeService) {}

  /**
   * Criar novo employee
   * - SUPER_ADMIN (role especial no banco): pode criar qualquer role
   * - OWNER: pode criar OWNER, ADMIN, STAFF, VIEWER
   * - ADMIN: pode criar STAFF, VIEWER
   */
  @Post()
  @Roles(EmployeeRole.OWNER, EmployeeRole.ADMIN)
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: any,
    @Headers('x-organization-id') headerOrgId: string,
    @Body() dto: CreateEmployeeDto,
  ): Promise<EmployeeEntity> {
    // SUPER_ADMIN pode especificar organizationId via header
    const organizationId = user.role === 'SUPER_ADMIN' && headerOrgId 
      ? headerOrgId 
      : user.organizationId;
    
    // SUPER_ADMIN não tem employee, usa user.role diretamente
    const creatorRole = user.role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : user.employee.role;
    
    return this.employeeService.createEmployee(
      organizationId,
      creatorRole,
      dto,
    );
  }

  /**
   * Listar employees da organização
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @CurrentUser() user: any,
    @Query('storeId') storeId?: string,
    @Query('role') role?: EmployeeRole,
    @Query('jobTitle') jobTitle?: JobTitle,
    @Query('active') active?: string,
  ): Promise<EmployeeEntity[]> {
    const filters: any = {};
    if (storeId) filters.storeId = storeId;
    if (role) filters.role = role;
    if (jobTitle) filters.jobTitle = jobTitle;
    if (active !== undefined) filters.active = active === 'true';

    return this.employeeService.findByOrganization(user.organizationId, filters);
  }

  /**
   * Buscar employee por ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id') id: string): Promise<EmployeeEntity> {
    const employee = await this.employeeService.findById(id);
    if (!employee) {
      throw new Error('Employee not found');
    }
    return employee;
  }

  /**
   * Atualizar employee
   */
  @Put(':id')
  @Roles(EmployeeRole.OWNER, EmployeeRole.ADMIN)
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() data: Partial<EmployeeEntity>,
  ): Promise<EmployeeEntity> {
    const employee = await this.employeeService.update(id, data);
    if (!employee) {
      throw new Error('Employee not found');
    }
    return employee;
  }
}
