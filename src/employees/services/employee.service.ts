import { Injectable, ForbiddenException, BadRequestException, Inject, Logger } from '@nestjs/common';
import { EmployeesRepository } from '../repositories/employees.repository';
import { UsersRepository } from '../../users/users.repository';
import { PlanLimitsService } from '../../organizations/services/plan-limits.service';
import { EmployeeEntity, EmployeeRole, JobTitle } from '../entities/employee.entity';
import { UserStatus } from '../../users/entities/user.entity';
import { CreateEmployeeDto } from '../dto/create-employee.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EmployeeService {
  private readonly logger = new Logger(EmployeeService.name);
  
  constructor(
    private readonly employeesRepository: EmployeesRepository,
    private readonly usersRepository: UsersRepository,
    @Inject(PlanLimitsService)
    private readonly planLimitsService: PlanLimitsService,
  ) {}

  /**
   * Valida se o criador tem permissão para criar um employee com a role especificada
   */
  private validateRolePermission(creatorRole: string, targetRole: EmployeeRole): void {
    this.logger.log(`🔍 [ROLE HIERARCHY] Validating role permission - Creator: ${creatorRole}, Target: ${targetRole}`);
    
    // SUPER_ADMIN (role especial no banco) pode criar qualquer role
    if (creatorRole === 'SUPER_ADMIN') {
      this.logger.log(`✅ [ROLE HIERARCHY] SUPER_ADMIN can create any role - Target: ${targetRole}`);
      return;
    }

    // OWNER pode criar: OWNER, ADMIN, STAFF, VIEWER
    if (creatorRole === EmployeeRole.OWNER) {
      const allowedRoles = [EmployeeRole.OWNER, EmployeeRole.ADMIN, EmployeeRole.STAFF, EmployeeRole.VIEWER];
      if (!allowedRoles.includes(targetRole)) {
        this.logger.error(`❌ [ROLE HIERARCHY] FORBIDDEN - OWNER trying to create ${targetRole}, Allowed: ${allowedRoles.join(', ')}`);
        throw new ForbiddenException('OWNER can only create OWNER, ADMIN, STAFF, or VIEWER roles');
      }
      this.logger.log(`✅ [ROLE HIERARCHY] OWNER can create ${targetRole}`);
      return;
    }

    // ADMIN pode criar: STAFF, VIEWER
    if (creatorRole === EmployeeRole.ADMIN) {
      const allowedRoles = [EmployeeRole.STAFF, EmployeeRole.VIEWER];
      if (!allowedRoles.includes(targetRole)) {
        this.logger.error(`❌ [ROLE HIERARCHY] FORBIDDEN - ADMIN trying to create ${targetRole}, Allowed: ${allowedRoles.join(', ')}`);
        throw new ForbiddenException('ADMIN can only create STAFF or VIEWER roles');
      }
      this.logger.log(`✅ [ROLE HIERARCHY] ADMIN can create ${targetRole}`);
      return;
    }

    // STAFF e VIEWER não podem criar employees
    this.logger.error(`❌ [ROLE HIERARCHY] FORBIDDEN - ${creatorRole} cannot create employees`);
    throw new ForbiddenException(`${creatorRole} does not have permission to create employees`);
  }

  /**
   * Cria um novo employee
   */
  async createEmployee(
    organizationId: string,
    creatorRole: string,
    dto: CreateEmployeeDto,
  ): Promise<EmployeeEntity> {
    this.logger.log(`🔍 [BUSINESS RULE] Creating employee - Email: ${dto.email}, Role: ${dto.role}, JobTitle: ${dto.jobTitle}, CreatorRole: ${creatorRole}, OrgID: ${organizationId}`);
    
    // Validar limites do plano
    await this.planLimitsService.validateEmployeeCreation(organizationId);

    // Validar permissão
    this.validateRolePermission(creatorRole, dto.role);

    // Verificar se email já existe
    const existingUser = await this.usersRepository.findByEmail(organizationId, dto.email);
    if (existingUser) {
      this.logger.error(`❌ [BUSINESS RULE] EMAIL_ALREADY_EXISTS - Email: ${dto.email}, OrgID: ${organizationId}`);
      throw new BadRequestException('EMAIL_ALREADY_EXISTS: Email already registered');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Criar user
    const user = await this.usersRepository.create({
      organizationId,
      email: dto.email,
      name: dto.name,
      password: hashedPassword,
      status: UserStatus.ACTIVE,
    });

    // Criar employee
    const employee = await this.employeesRepository.create({
      userId: user.id,
      organizationId,
      role: dto.role,
      jobTitle: dto.jobTitle,
      active: dto.active !== undefined ? dto.active : true,
    });

    // Vincular às lojas se fornecido
    if (dto.storeIds && dto.storeIds.length > 0) {
      await this.employeesRepository.linkStores(employee.id, dto.storeIds);
    }

    return employee;
  }

  /**
   * Lista employees da organização
   */
  async findByOrganization(
    organizationId: string,
    filters?: {
      storeId?: string;
      role?: EmployeeRole;
      jobTitle?: JobTitle;
      active?: boolean;
    },
  ): Promise<EmployeeEntity[]> {
    return this.employeesRepository.findByOrganization(organizationId, filters);
  }

  /**
   * Busca employee por ID
   */
  async findById(id: string): Promise<EmployeeEntity | null> {
    return this.employeesRepository.findById(id);
  }

  /**
   * Atualiza employee
   */
  async update(id: string, data: Partial<EmployeeEntity>): Promise<EmployeeEntity | null> {
    return this.employeesRepository.update(id, data);
  }
}
