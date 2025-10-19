import { Injectable, CanActivate, ExecutionContext, ForbiddenException, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { EmployeeRole } from '../../employees/entities/employee.entity';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: EmployeeRole[]) => SetMetadata(ROLES_KEY, roles);

/**
 * RoleGuard - Valida se o employee tem uma das roles necessárias
 * 
 * Uso:
 * @Roles(EmployeeRole.OWNER, EmployeeRole.ADMIN)
 * @UseGuards(JwtAuthGuard, RoleGuard)
 */
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<EmployeeRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // Sem restrição de role
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.employee) {
      throw new ForbiddenException('FORBIDDEN');
    }

    // SUPER_ADMIN (role especial no banco) tem acesso a tudo
    if (user.employee.role === 'SUPER_ADMIN') {
      return true;
    }

    const hasRole = requiredRoles.includes(user.employee.role);
    
    if (!hasRole) {
      throw new ForbiddenException('ROLE_NOT_ALLOWED');
    }

    return true;
  }
}


