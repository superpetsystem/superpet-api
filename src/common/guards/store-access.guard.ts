import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { EmployeesRepository } from '../../employees/repositories/employees.repository';
import { StoresRepository } from '../../stores/repositories/stores.repository';
import { EmployeeRole } from '../../employees/entities/employee.entity';

/**
 * StoreAccessGuard - Valida se o employee tem acesso à store
 * 
 * OWNER/ADMIN: acesso a todas as stores DA SUA ORGANIZAÇÃO
 * STAFF/VIEWER: apenas stores vinculadas DA SUA ORGANIZAÇÃO
 * SUPER_ADMIN: acesso a todas as stores (cross-tenant)
 * 
 * Uso:
 * @UseGuards(JwtAuthGuard, StoreAccessGuard)
 * 
 * Requer que o storeId esteja em request.params
 */
@Injectable()
export class StoreAccessGuard implements CanActivate {
  constructor(
    private employeesRepository: EmployeesRepository,
    private storesRepository: StoresRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const storeId = request.params.storeId || request.params.id;

    if (!user || !user.employee) {
      throw new ForbiddenException('FORBIDDEN');
    }

    const employee = user.employee;

    // SUPER_ADMIN tem acesso a todas as stores (cross-tenant)
    if (employee.role === 'SUPER_ADMIN') {
      return true;
    }

    if (!storeId) {
      throw new ForbiddenException('Store ID not found in request');
    }

    // Verificar se a store pertence à organização do usuário
    const store = await this.storesRepository.findByOrganizationAndId(user.organizationId, storeId);
    if (!store) {
      throw new ForbiddenException('STORE_ACCESS_DENIED');
    }

    // OWNER/ADMIN têm acesso a todas as stores da sua organização
    if ([EmployeeRole.OWNER, EmployeeRole.ADMIN].includes(employee.role)) {
      return true;
    }

    // STAFF/VIEWER: verificar vínculo específico
    const hasAccess = await this.employeesRepository.checkStoreAccess(employee.id, storeId);
    
    if (!hasAccess) {
      throw new ForbiddenException('STORE_ACCESS_DENIED');
    }

    return true;
  }
}


