import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationEntity } from '../entities/organization.entity';
import { StoreEntity } from '../../stores/entities/store.entity';
import { EmployeeEntity } from '../../employees/entities/employee.entity';

@Injectable()
export class PlanLimitsService {
  private readonly logger = new Logger(PlanLimitsService.name);
  
  constructor(
    @InjectRepository(OrganizationEntity)
    private readonly organizationRepository: Repository<OrganizationEntity>,
    @InjectRepository(StoreEntity)
    private readonly storeRepository: Repository<StoreEntity>,
    @InjectRepository(EmployeeEntity)
    private readonly employeeRepository: Repository<EmployeeEntity>,
  ) {}

  /**
   * Valida se pode criar nova store (baseado nos limites do plano)
   */
  async validateStoreCreation(organizationId: string): Promise<void> {
    this.logger.log(`🔍 [PLAN LIMITS] Validating store creation - OrgID: ${organizationId}`);
    
    const org = await this.organizationRepository.findOne({
      where: { id: organizationId },
    });

    if (!org || !org.limits) {
      this.logger.log(`✅ [PLAN LIMITS] No limits defined - Store creation allowed - OrgID: ${organizationId}`);
      return; // Sem limites definidos
    }

    const currentCount = await this.storeRepository.count({
      where: { organizationId },
    });

    const maxStores = org.limits.stores;
    
    this.logger.log(`📊 [PLAN LIMITS] Store count - Plan: ${org.plan}, Current: ${currentCount}, Max: ${maxStores}, OrgID: ${organizationId}`);
    
    if (maxStores && currentCount >= maxStores) {
      this.logger.error(`❌ [PLAN LIMITS] STORE_LIMIT_EXCEEDED - Plan: ${org.plan}, Max: ${maxStores}, Current: ${currentCount}, OrgID: ${organizationId}`);
      throw new BadRequestException(
        `STORE_LIMIT_EXCEEDED: Plano ${org.plan} permite no máximo ${maxStores} lojas. Atual: ${currentCount}`
      );
    }
    
    this.logger.log(`✅ [PLAN LIMITS] Store creation allowed - ${currentCount + 1}/${maxStores} - OrgID: ${organizationId}`);
  }

  /**
   * Valida se pode criar novo employee (baseado nos limites do plano)
   */
  async validateEmployeeCreation(organizationId: string): Promise<void> {
    this.logger.log(`🔍 [PLAN LIMITS] Validating employee creation - OrgID: ${organizationId}`);
    
    const org = await this.organizationRepository.findOne({
      where: { id: organizationId },
    });

    if (!org || !org.limits) {
      this.logger.log(`✅ [PLAN LIMITS] No limits defined - Employee creation allowed - OrgID: ${organizationId}`);
      return; // Sem limites definidos
    }

    const currentCount = await this.employeeRepository.count({
      where: { organizationId },
    });

    const maxEmployees = org.limits.employees;
    
    this.logger.log(`📊 [PLAN LIMITS] Employee count - Plan: ${org.plan}, Current: ${currentCount}, Max: ${maxEmployees}, OrgID: ${organizationId}`);
    
    if (maxEmployees && currentCount >= maxEmployees) {
      this.logger.error(`❌ [PLAN LIMITS] EMPLOYEE_LIMIT_EXCEEDED - Plan: ${org.plan}, Max: ${maxEmployees}, Current: ${currentCount}, OrgID: ${organizationId}`);
      throw new BadRequestException(
        `EMPLOYEE_LIMIT_EXCEEDED: Plano ${org.plan} permite no máximo ${maxEmployees} funcionários. Atual: ${currentCount}`
      );
    }
    
    this.logger.log(`✅ [PLAN LIMITS] Employee creation allowed - ${currentCount + 1}/${maxEmployees} - OrgID: ${organizationId}`);
  }

  /**
   * Valida se a organização pode usar determinada feature
   */
  async validateFeatureAccess(organizationId: string, featureKey: string): Promise<void> {
    // TODO: Implementar validação baseada em features.minPlanRequired
    // Por enquanto, permitir todas
  }

  /**
   * Retorna os limites atuais da organização
   */
  async getOrganizationLimits(organizationId: string): Promise<any> {
    const org = await this.organizationRepository.findOne({
      where: { id: organizationId },
    });

    if (!org) {
      return null;
    }

    const storesCount = await this.storeRepository.count({ where: { organizationId } });
    const employeesCount = await this.employeeRepository.count({ where: { organizationId } });

    return {
      plan: org.plan,
      limits: org.limits,
      current: {
        stores: storesCount,
        employees: employeesCount,
      },
      available: {
        stores: org.limits?.stores ? org.limits.stores - storesCount : '∞',
        employees: org.limits?.employees ? org.limits.employees - employeesCount : '∞',
      },
    };
  }
}

