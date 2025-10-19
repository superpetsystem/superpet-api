import { Injectable, BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import { StoresRepository } from '../repositories/stores.repository';
import { StoreFeatureRepository } from '../repositories/store-feature.repository';
import { PlanLimitsService } from '../../organizations/services/plan-limits.service';
import { CreateStoreDto } from '../dto/create-store.dto';
import { StoreEntity } from '../entities/store.entity';

@Injectable()
export class StoreService {
  constructor(
    private readonly storesRepository: StoresRepository,
    private readonly storeFeatureRepository: StoreFeatureRepository,
    @Inject(PlanLimitsService)
    private readonly planLimitsService: PlanLimitsService,
  ) {}

  private validateOpeningHours(openingHours: any): void {
    if (!openingHours) return;

    const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

    for (const day of days) {
      const intervals = openingHours[day];
      if (!intervals) continue;

      // Verificar sobreposições
      for (let i = 0; i < intervals.length; i++) {
        for (let j = i + 1; j < intervals.length; j++) {
          const [start1, end1] = intervals[i];
          const [start2, end2] = intervals[j];

          if (
            (start1 >= start2 && start1 < end2) ||
            (start2 >= start1 && start2 < end1)
          ) {
            throw new BadRequestException('INVALID_OPENING_HOURS');
          }
        }
      }
    }
  }

  private validateCapacity(resourcesCatalog: string[], capacity: any): void {
    if (!capacity || !resourcesCatalog) return;

    for (const resource in capacity) {
      if (!resourcesCatalog.includes(resource)) {
        throw new BadRequestException('CAPACITY_RESOURCE_UNKNOWN');
      }
    }
  }

  async create(organizationId: string, dto: CreateStoreDto): Promise<StoreEntity> {
    // Validar limites do plano
    await this.planLimitsService.validateStoreCreation(organizationId);

    // Validar code único
    const codeExists = await this.storesRepository.checkCodeExists(organizationId, dto.code);
    if (codeExists) {
      throw new BadRequestException('STORE_CODE_TAKEN');
    }

    // Validar openingHours
    this.validateOpeningHours(dto.openingHours);

    // Validar capacity
    this.validateCapacity(dto.resourcesCatalog || [], dto.capacity);

    // Criar store
    const store = await this.storesRepository.create({
      organizationId,
      ...dto,
      timezone: dto.timezone || 'America/Manaus',
      active: dto.active !== undefined ? dto.active : true,
    });

    // Criar feature padrão SERVICE_CATALOG habilitada
    await this.storeFeatureRepository.create({
      storeId: store.id,
      featureKey: 'SERVICE_CATALOG',
      enabled: true,
      limits: null,
    });

    return this.storesRepository.findById(store.id) as Promise<StoreEntity>;
  }

  async findById(id: string): Promise<StoreEntity> {
    const store = await this.storesRepository.findById(id);
    if (!store) {
      throw new NotFoundException('NOT_FOUND');
    }
    return store;
  }

  async findByOrganization(organizationId: string, active?: boolean): Promise<StoreEntity[]> {
    return this.storesRepository.findByOrganization(organizationId, active);
  }

  async update(id: string, dto: Partial<StoreEntity>): Promise<StoreEntity> {
    const store = await this.findById(id);

    // Validar openingHours se fornecido
    if (dto.openingHours) {
      this.validateOpeningHours(dto.openingHours);
    }

    // Validar capacity se fornecido
    if (dto.capacity) {
      this.validateCapacity(store.resourcesCatalog || [], dto.capacity);
    }

    const updated = await this.storesRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundException('NOT_FOUND');
    }

    return updated;
  }

  async updateStatus(id: string, active: boolean): Promise<StoreEntity> {
    const updated = await this.storesRepository.update(id, { active });
    if (!updated) {
      throw new NotFoundException('NOT_FOUND');
    }
    return updated;
  }
}


