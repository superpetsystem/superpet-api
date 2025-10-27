import { Injectable, CanActivate, ExecutionContext, ForbiddenException, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { StoreFeatureRepository } from '../../stores/repositories/store-feature.repository';
import { FeatureKey, FeatureAccessType } from '../../stores/entities/store-feature.entity';

export const FEATURE_KEY = 'requiredFeature';
export const RequireFeature = (feature: FeatureKey, accessType: FeatureAccessType = FeatureAccessType.STORE) => 
  SetMetadata(FEATURE_KEY, { feature, accessType });

/**
 * FeatureGuard - Valida se a store tem a feature habilitada
 * 
 * Uso:
 * @RequireFeature(FeatureKey.TELEPICKUP, FeatureAccessType.STORE)
 * @UseGuards(JwtAuthGuard, FeatureGuard)
 * 
 * Requer que o storeId esteja em request.params ou request.body
 */
@Injectable()
export class FeatureGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private storeFeatureRepository: StoreFeatureRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const featureConfig = this.reflector.getAllAndOverride<{ feature: FeatureKey; accessType: FeatureAccessType }>(FEATURE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!featureConfig) {
      return true; // Sem restrição de feature
    }

    const { feature: requiredFeature, accessType } = featureConfig;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    let storeId = request.params?.storeId || request.body?.storeId || user?.employee?.storeId;

    // Para endpoints de carrinho (ex: /carts/:cartId/items), obter storeId do carrinho
    if (!storeId && request.params?.cartId) {
      // Para evitar dependências circulares, vamos usar uma abordagem diferente
      // O storeId será obtido do contexto da requisição ou do body
      storeId = request.body?.storeId || user?.employee?.storeId;
    }

    // Endpoints de nível organizacional (ex: relatórios) não requerem storeId
    if (!storeId) {
      // Se não tem storeId, permite acesso (validação por organização)
      return true;
    }

    const isEnabled = await this.storeFeatureRepository.isFeatureEnabledForAccessType(storeId, requiredFeature, accessType);
    
    if (!isEnabled) {
      throw new ForbiddenException('FEATURE_NOT_ENABLED');
    }

    return true;
  }
}


