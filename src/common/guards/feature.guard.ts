import { Injectable, CanActivate, ExecutionContext, ForbiddenException, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { StoreFeatureRepository } from '../../stores/repositories/store-feature.repository';
import { FeatureKey } from '../../stores/entities/store-feature.entity';

export const FEATURE_KEY = 'requiredFeature';
export const RequireFeature = (feature: FeatureKey) => SetMetadata(FEATURE_KEY, feature);

/**
 * FeatureGuard - Valida se a store tem a feature habilitada
 * 
 * Uso:
 * @RequireFeature(FeatureKey.TELEPICKUP)
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
    const requiredFeature = this.reflector.getAllAndOverride<FeatureKey>(FEATURE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredFeature) {
      return true; // Sem restrição de feature
    }

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

    const isEnabled = await this.storeFeatureRepository.isFeatureEnabled(storeId, requiredFeature);
    
    if (!isEnabled) {
      throw new ForbiddenException('FEATURE_NOT_ENABLED');
    }

    return true;
  }
}


