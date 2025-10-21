import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PickupsRepository } from '../repositories/pickups.repository';
import { StoreFeatureRepository } from '../../stores/repositories/store-feature.repository';
import { CreatePickupDto } from '../dto/create-pickup.dto';
import { PickupEntity, PickupStatus } from '../entities/pickup.entity';
import { FeatureKey } from '../../stores/entities/store-feature.entity';

@Injectable()
export class PickupService {
  constructor(
    private readonly pickupsRepository: PickupsRepository,
    private readonly storeFeatureRepository: StoreFeatureRepository,
  ) {}

  async create(storeId: string, dto: CreatePickupDto): Promise<PickupEntity> {
    // Checar feature
    const feature = await this.storeFeatureRepository.findByStoreAndKey(storeId, FeatureKey.TELEPICKUP);
    if (!feature || !feature.enabled) {
      throw new ForbiddenException('FEATURE_NOT_ENABLED');
    }

    // Validar janela
    const windowStart = new Date(dto.pickupWindowStart);
    const windowEnd = new Date(dto.pickupWindowEnd);

    if (windowEnd <= windowStart) {
      throw new BadRequestException('PICKUP_INVALID_WINDOW');
    }

    // Janela mínima de 30 minutos
    const diff = (windowEnd.getTime() - windowStart.getTime()) / 1000 / 60;
    if (diff < 30) {
      throw new BadRequestException('PICKUP_INVALID_WINDOW');
    }

    // Verificar limite diário
    if (feature.limits?.dailyPickups) {
      const date = windowStart.toISOString().split('T')[0];
      const count = await this.pickupsRepository.countByStoreAndDate(storeId, date);

      if (count >= feature.limits.dailyPickups) {
        throw new ForbiddenException('PICKUP_LIMIT_REACHED');
      }
    }

    return this.pickupsRepository.create({
      storeId,
      customerId: dto.customerId,
      petId: dto.petId,
      pickupWindowStart: windowStart,
      pickupWindowEnd: windowEnd,
      addressOverride: dto.addressOverride || null,
      status: PickupStatus.REQUESTED,
    });
  }

  async findById(id: string): Promise<PickupEntity> {
    const pickup = await this.pickupsRepository.findById(id);
    if (!pickup) {
      throw new NotFoundException('NOT_FOUND');
    }
    return pickup;
  }

  async findByStore(storeId: string, date?: string): Promise<PickupEntity[]> {
    return this.pickupsRepository.findByStore(storeId, date);
  }

  async updateStatus(id: string, status: PickupStatus): Promise<PickupEntity> {
    const updated = await this.pickupsRepository.updateStatus(id, status);
    if (!updated) {
      throw new NotFoundException('NOT_FOUND');
    }
    return updated;
  }
}


