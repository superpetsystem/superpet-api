import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { StoreFeatureRepository } from '../../stores/repositories/store-feature.repository';
import { FeatureKey } from '../../stores/entities/store-feature.entity';
import { CartRepository } from '../../pdv/repositories/cart.repository';

export const FEATURE_KEY = 'requiredFeature';

/**
 * PdvFeatureGuard - Valida se a store tem a feature PDV habilitada
 * Resolve storeId do carrinho quando necessário
 */
@Injectable()
export class PdvFeatureGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private storeFeatureRepository: StoreFeatureRepository,
    private cartRepository: CartRepository,
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
      try {
        const cart = await this.cartRepository.findById(request.params.cartId, user.organizationId);
        if (cart) {
          storeId = cart.storeId;
        }
      } catch (error) {
        // Se não conseguir obter o carrinho, continua sem storeId
      }
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
