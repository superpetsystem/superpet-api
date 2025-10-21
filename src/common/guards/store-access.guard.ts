import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { EmployeesRepository } from '../../employees/repositories/employees.repository';
import { EmployeeRole } from '../../employees/entities/employee.entity';

/**
 * StoreAccessGuard - Valida se o employee tem acesso à store
 * 
 * OWNER/ADMIN: acesso a todas as stores
 * STAFF/VIEWER: apenas stores vinculadas
 * 
 * Uso:
 * @UseGuards(JwtAuthGuard, StoreAccessGuard)
 * 
 * Requer que o storeId esteja em request.params
 */
@Injectable()
export class StoreAccessGuard implements CanActivate {
  constructor(private employeesRepository: EmployeesRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const storeId = request.params.storeId || request.params.id;

    if (!user || !user.employee) {
      throw new ForbiddenException('FORBIDDEN');
    }

    const employee = user.employee;

    // SUPER_ADMIN (role especial)/OWNER/ADMIN têm acesso a todas as stores
    if (['SUPER_ADMIN', EmployeeRole.OWNER, EmployeeRole.ADMIN].includes(employee.role)) {
      return true;
    }

    // STAFF/VIEWER: verificar vínculo
    if (!storeId) {
      throw new ForbiddenException('Store ID not found in request');
    }

    const hasAccess = await this.employeesRepository.checkStoreAccess(employee.id, storeId);
    
    if (!hasAccess) {
      throw new ForbiddenException('STORE_ACCESS_DENIED');
    }

    return true;
  }
}


