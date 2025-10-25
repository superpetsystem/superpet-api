import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * TenantGuard - Resolve e valida organizationId do tenant
 * 
 * Origem do tenant (em ordem de prioridade):
 * 1. JWT claim (user.organizationId) - via JwtAuthGuard
 * 2. Header X-Org-Id (fallback ou uso interno/admin)
 * 
 * Adiciona organizationId ao request para uso nos services
 */
@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    // Tentar obter organizationId de múltiplas fontes
    let organizationId: string | null = null;

    // 1. JWT claim (prioridade)
    if (user && user.organizationId) {
      organizationId = user.organizationId;
    }

    // 2. Header X-Org-Id (fallback)
    if (!organizationId) {
      const headerOrgId = request.headers['x-org-id'];
      if (headerOrgId && typeof headerOrgId === 'string') {
        organizationId = headerOrgId;
      }
    }

    // Se não encontrou organizationId, verificar se é SUPER_ADMIN
    if (!organizationId) {
      if (user && user.role === 'SUPER_ADMIN') {
        // SUPER_ADMIN pode usar header X-Org-Id ou usar organização padrão
        const headerOrgId = request.headers['x-org-id'];
        if (headerOrgId && typeof headerOrgId === 'string') {
          organizationId = headerOrgId;
        } else {
          // Para SUPER_ADMIN sem organizationId, usar null (será tratado nos services)
          organizationId = null;
        }
      } else {
        throw new UnauthorizedException('TENANT_REQUIRED');
      }
    }

    // Adicionar ao request para uso nos services
    request.organizationId = organizationId;

    return true;
  }
}

