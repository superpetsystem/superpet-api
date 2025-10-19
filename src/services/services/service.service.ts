import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ServicesRepository } from '../repositories/services.repository';
import { CreateServiceDto } from '../dto/create-service.dto';
import { ServiceEntity, ServiceVisibility } from '../entities/service.entity';

@Injectable()
export class ServiceService {
  constructor(private readonly servicesRepository: ServicesRepository) {}

  async create(organizationId: string, dto: CreateServiceDto): Promise<ServiceEntity> {
    // Validar code único
    const codeExists = await this.servicesRepository.checkCodeExists(organizationId, dto.code);
    if (codeExists) {
      throw new BadRequestException('SERVICE_CODE_TAKEN');
    }

    // Validar durationMinutes
    if (dto.durationMinutes < 1 || dto.durationMinutes > 480) {
      throw new BadRequestException('INVALID_DURATION');
    }

    // Validar addons (sem ciclos)
    if (dto.addons && dto.addons.length > 0) {
      // TODO: Implementar verificação completa de ciclos
      const hasCycles = await this.servicesRepository.checkAddonCycles('new', dto.addons);
      if (hasCycles) {
        throw new BadRequestException('ADDON_CYCLE_DETECTED');
      }
    }

    return this.servicesRepository.create({
      organizationId,
      ...dto,
      visibility: dto.visibility || ServiceVisibility.PUBLIC,
      active: dto.active !== undefined ? dto.active : true,
      bufferBefore: dto.bufferBefore || 0,
      bufferAfter: dto.bufferAfter || 0,
    });
  }

  async findById(id: string): Promise<ServiceEntity> {
    const service = await this.servicesRepository.findById(id);
    if (!service) {
      throw new NotFoundException('NOT_FOUND');
    }
    return service;
  }

  async findByOrganization(organizationId: string, filters?: any): Promise<ServiceEntity[]> {
    return this.servicesRepository.findByOrganization(organizationId, filters);
  }

  async update(id: string, dto: Partial<ServiceEntity>): Promise<ServiceEntity> {
    const service = await this.findById(id);

    // Code é imutável
    if (dto.code && dto.code !== service.code) {
      throw new BadRequestException('Service code is immutable');
    }

    // Validar durationMinutes
    if (dto.durationMinutes) {
      if (dto.durationMinutes < 1 || dto.durationMinutes > 480) {
        throw new BadRequestException('INVALID_DURATION');
      }
    }

    const updated = await this.servicesRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundException('NOT_FOUND');
    }

    return updated;
  }

  async updateStatus(id: string, active: boolean): Promise<ServiceEntity> {
    const updated = await this.servicesRepository.update(id, { active });
    if (!updated) {
      throw new NotFoundException('NOT_FOUND');
    }
    return updated;
  }

  async updateAddons(id: string, addons: string[]): Promise<ServiceEntity> {
    // Validar ciclos
    const hasCycles = await this.servicesRepository.checkAddonCycles(id, addons);
    if (hasCycles) {
      throw new BadRequestException('ADDON_CYCLE_DETECTED');
    }

    const updated = await this.servicesRepository.update(id, { addons });
    if (!updated) {
      throw new NotFoundException('NOT_FOUND');
    }

    return updated;
  }
}


