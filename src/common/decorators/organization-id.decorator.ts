import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator para extrair organizationId do request
 * 
 * Uso:
 * async method(@OrganizationId() organizationId: string) { ... }
 * 
 * Requer TenantGuard antes para popular request.organizationId
 */
export const OrganizationId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.organizationId || request.user?.organizationId;
  },
);





