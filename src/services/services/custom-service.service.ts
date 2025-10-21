import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CustomServiceRepository } from '../repositories/custom-service.repository';
import { StoreFeatureRepository } from '../../stores/repositories/store-feature.repository';
import { CreateCustomServiceDto } from '../dto/create-custom-service.dto';
import { CustomServiceEntity, CustomServiceState } from '../entities/custom-service.entity';
import { FeatureKey } from '../../stores/entities/store-feature.entity';

@Injectable()
export class CustomServiceService {
  constructor(
    private readonly customServiceRepository: CustomServiceRepository,
    private readonly storeFeatureRepository: StoreFeatureRepository,
  ) {}

  private async checkFeatures(storeId: string): Promise<void> {
    const serviceCatalog = await this.storeFeatureRepository.isFeatureEnabled(storeId, FeatureKey.SERVICE_CATALOG);
    const customService = await this.storeFeatureRepository.isFeatureEnabled(storeId, FeatureKey.CUSTOM_SERVICE);

    if (!serviceCatalog || !customService) {
      throw new ForbiddenException('FEATURE_NOT_ENABLED');
    }
  }

  async create(storeId: string, dto: CreateCustomServiceDto): Promise<CustomServiceEntity> {
    // Checar features
    await this.checkFeatures(storeId);

    // Verificar se já existe
    const exists = await this.customServiceRepository.checkExists(storeId, dto.serviceId);
    if (exists) {
      throw new BadRequestException('CUSTOMSERVICE_ALREADY_EXISTS');
    }

    // Validar overrides
    if (dto.priceOverrideCents !== undefined && dto.priceOverrideCents < 0) {
      throw new BadRequestException('CUSTOMSERVICE_INVALID_OVERRIDE');
    }

    if (dto.durationMinutesOverride && (dto.durationMinutesOverride < 1 || dto.durationMinutesOverride > 480)) {
      throw new BadRequestException('CUSTOMSERVICE_INVALID_OVERRIDE');
    }

    return this.customServiceRepository.create({
      storeId,
      ...dto,
      state: CustomServiceState.DRAFT,
    });
  }

  async findById(id: string): Promise<CustomServiceEntity> {
    const customService = await this.customServiceRepository.findById(id);
    if (!customService) {
      throw new NotFoundException('NOT_FOUND');
    }
    return customService;
  }

  async findByStore(storeId: string, filters?: any): Promise<CustomServiceEntity[]> {
    return this.customServiceRepository.findByStore(storeId, filters);
  }

  async update(id: string, dto: Partial<CustomServiceEntity>): Promise<CustomServiceEntity> {
    const customService = await this.findById(id);

    // Só pode editar DRAFT
    if (customService.state !== CustomServiceState.DRAFT) {
      throw new BadRequestException('INVALID_STATE_TRANSITION');
    }

    // Validar overrides
    if (dto.priceOverrideCents !== undefined && dto.priceOverrideCents !== null) {
      if (dto.priceOverrideCents < 0) {
        throw new BadRequestException('CUSTOMSERVICE_INVALID_OVERRIDE');
      }
    }

    const updated = await this.customServiceRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundException('NOT_FOUND');
    }

    return updated;
  }

  async publish(id: string): Promise<CustomServiceEntity> {
    const customService = await this.findById(id);

    // Checar features
    await this.checkFeatures(customService.storeId);

    if (customService.state === CustomServiceState.PUBLISHED) {
      return customService;
    }

    const updated = await this.customServiceRepository.update(id, { state: CustomServiceState.PUBLISHED });
    if (!updated) {
      throw new NotFoundException('NOT_FOUND');
    }

    return updated;
  }

  async archive(id: string): Promise<CustomServiceEntity> {
    const customService = await this.findById(id);

    const updated = await this.customServiceRepository.update(id, { state: CustomServiceState.ARCHIVED });
    if (!updated) {
      throw new NotFoundException('NOT_FOUND');
    }

    return updated;
  }

  async delete(id: string): Promise<void> {
    const customService = await this.findById(id);

    // Só pode deletar DRAFT ou ARCHIVED
    if (customService.state === CustomServiceState.PUBLISHED) {
      throw new BadRequestException('INVALID_STATE_TRANSITION');
    }

    await this.customServiceRepository.softDelete(id);
  }
}

