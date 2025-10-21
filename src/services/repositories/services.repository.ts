import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceEntity, ServiceVisibility } from '../entities/service.entity';

@Injectable()
export class ServicesRepository {
  constructor(
    @InjectRepository(ServiceEntity)
    private readonly repository: Repository<ServiceEntity>,
  ) {}

  async create(data: Partial<ServiceEntity>): Promise<ServiceEntity> {
    const service = this.repository.create(data);
    return this.repository.save(service);
  }

  async findById(id: string): Promise<ServiceEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByOrganization(
    organizationId: string,
    filters?: { query?: string; active?: boolean; visibility?: ServiceVisibility },
  ): Promise<ServiceEntity[]> {
    const where: any = { organizationId };

    if (filters?.active !== undefined) {
      where.active = filters.active;
    }

    if (filters?.visibility) {
      where.visibility = filters.visibility;
    }

    const query = this.repository.createQueryBuilder('service').where(where);

    if (filters?.query) {
      query.andWhere('(service.name LIKE :query OR service.code LIKE :query)', {
        query: `%${filters.query}%`,
      });
    }

    return query.getMany();
  }

  async findByCode(organizationId: string, code: string): Promise<ServiceEntity | null> {
    return this.repository.findOne({ where: { organizationId, code } });
  }

  async checkCodeExists(organizationId: string, code: string): Promise<boolean> {
    const count = await this.repository.count({ where: { organizationId, code } });
    return count > 0;
  }

  async checkAddonCycles(serviceId: string, addonIds: string[]): Promise<boolean> {
    // Implementação simplificada: verificar se algum addon tem o serviceId em seus addons
    // (Para detectar ciclos completos, seria necessário um algoritmo de busca em grafo)
    if (addonIds.includes(serviceId)) {
      return true; // Ciclo direto
    }

    // TODO: Implementar verificação de ciclos indiretos
    return false;
  }

  async update(id: string, data: Partial<ServiceEntity>): Promise<ServiceEntity | null> {
    await this.repository.update(id, data);
    return this.findById(id);
  }
}
