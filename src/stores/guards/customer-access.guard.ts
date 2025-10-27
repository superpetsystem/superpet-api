import { Injectable, CanActivate, ExecutionContext, ForbiddenException, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FeatureAccessService } from '../services/feature-access.service';

export const REQUIRE_CUSTOMER_ACCESS_KEY = 'requireCustomerAccess';
export const RequireCustomerAccess = (featureKey: string) => SetMetadata(REQUIRE_CUSTOMER_ACCESS_KEY, featureKey);

@Injectable()
export class CustomerAccessGuard implements CanActivate {
  constructor(
    private readonly featureAccessService: FeatureAccessService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredFeatureKey = this.reflector.getAllAndOverride<string>(
      REQUIRE_CUSTOMER_ACCESS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredFeatureKey) {
      return true; // No specific feature access required for this endpoint
    }

    const request = context.switchToHttp().getRequest();
    const storeId = this.extractStoreId(request);

    if (!storeId) {
      throw new ForbiddenException('Store ID is required for customer access validation');
    }

    // Verificar se a feature está disponível para clientes
    const isAvailable = await this.featureAccessService.isFeatureAvailableForCustomers(
      storeId,
      requiredFeatureKey,
    );

    if (!isAvailable) {
      throw new ForbiddenException(`Feature ${requiredFeatureKey} is not available for customers in this store`);
    }

    return true;
  }

  private extractStoreId(request: any): string | null {
    // Tentar obter storeId de diferentes fontes
    return (
      request.params?.storeId ||
      request.headers?.['x-store-id'] ||
      request.body?.storeId ||
      request.query?.storeId ||
      null
    );
  }
}
