import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { CustomerEntity } from '../../customers/entities/customer.entity';
import { PetEntity } from '../../pets/entities/pet.entity';
import { StoreEntity } from '../../stores/entities/store.entity';
import { ReportFiltersDto, ReportPeriod } from '../dto/report-filters.dto';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    @InjectRepository(CustomerEntity)
    private readonly customerRepository: Repository<CustomerEntity>,
    @InjectRepository(PetEntity)
    private readonly petRepository: Repository<PetEntity>,
    @InjectRepository(StoreEntity)
    private readonly storeRepository: Repository<StoreEntity>,
  ) {}

  private getDateRange(filters: ReportFiltersDto): { startDate: Date; endDate: Date } {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    if (filters.period === ReportPeriod.TODAY) {
      startDate = new Date(now.setHours(0, 0, 0, 0));
    } else if (filters.period === ReportPeriod.WEEK) {
      startDate = new Date(now.setDate(now.getDate() - 7));
    } else if (filters.period === ReportPeriod.MONTH) {
      startDate = new Date(now.setMonth(now.getMonth() - 1));
    } else if (filters.period === ReportPeriod.YEAR) {
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
    } else if (filters.startDate && filters.endDate) {
      startDate = new Date(filters.startDate);
      endDate = new Date(filters.endDate);
    } else {
      // Default: último mês
      startDate = new Date(now.setMonth(now.getMonth() - 1));
    }

    return { startDate, endDate };
  }

  /**
   * Dashboard Overview
   */
  async getDashboardOverview(organizationId: string, storeId?: string): Promise<any> {
    this.logger.log(`📊 [REPORTS] Dashboard overview - OrgID: ${organizationId}, StoreID: ${storeId || 'all'}`);

    const whereCondition: any = { organizationId };
    if (storeId) {
      whereCondition.storeId = storeId;
    }

    const [totalCustomers, totalPets, totalStores] = await Promise.all([
      this.customerRepository.count({ where: { organizationId } }),
      this.petRepository.count({ where: { organizationId } }),
      this.storeRepository.count({ where: { organizationId } }),
    ]);

    this.logger.log(`✅ [REPORTS] Overview generated - Customers: ${totalCustomers}, Pets: ${totalPets}, Stores: ${totalStores}`);

    return {
      customers: totalCustomers,
      pets: totalPets,
      stores: totalStores,
      period: 'all_time',
    };
  }

  /**
   * Customer Report
   */
  async getCustomerReport(organizationId: string, filters: ReportFiltersDto): Promise<any> {
    this.logger.log(`📊 [REPORTS] Customer report - OrgID: ${organizationId}, Period: ${filters.period}`);

    const { startDate, endDate } = this.getDateRange(filters);

    const newCustomers = await this.customerRepository.count({
      where: {
        organizationId,
        createdAt: Between(startDate, endDate),
      },
    });

    const totalCustomers = await this.customerRepository.count({
      where: { organizationId },
    });

    this.logger.log(`✅ [REPORTS] Customer report - New: ${newCustomers}, Total: ${totalCustomers}`);

    return {
      period: filters.period || 'CUSTOM',
      startDate,
      endDate,
      newCustomers,
      totalCustomers,
      activeCustomers: totalCustomers, // TODO: Filtrar por status ACTIVE
    };
  }

  /**
   * Pet Report
   */
  async getPetReport(organizationId: string, filters: ReportFiltersDto): Promise<any> {
    this.logger.log(`📊 [REPORTS] Pet report - OrgID: ${organizationId}, Period: ${filters.period}`);

    const { startDate, endDate } = this.getDateRange(filters);

    const newPets = await this.petRepository.count({
      where: {
        organizationId,
        createdAt: Between(startDate, endDate),
      },
    });

    const totalPets = await this.petRepository.count({
      where: { organizationId },
    });

    // Contar por espécie
    const petsBySpecies = await this.petRepository
      .createQueryBuilder('pet')
      .select('pet.species', 'species')
      .addSelect('COUNT(*)', 'count')
      .where('pet.organization_id = :organizationId', { organizationId })
      .groupBy('pet.species')
      .getRawMany();

    this.logger.log(`✅ [REPORTS] Pet report - New: ${newPets}, Total: ${totalPets}`);

    return {
      period: filters.period || 'CUSTOM',
      startDate,
      endDate,
      newPets,
      totalPets,
      bySpecies: petsBySpecies.reduce((acc, item) => {
        acc[item.species] = parseInt(item.count);
        return acc;
      }, {}),
    };
  }

  /**
   * Store Performance Report
   */
  async getStorePerformance(storeId: string, filters: ReportFiltersDto): Promise<any> {
    this.logger.log(`📊 [REPORTS] Store performance - StoreID: ${storeId}, Period: ${filters.period}`);

    const store = await this.storeRepository.findOne({ where: { id: storeId } });

    if (!store) {
      return null;
    }

    // TODO: Adicionar métricas de serviços agendados, realizados, cancelados
    // Por enquanto retornar estrutura básica

    this.logger.log(`✅ [REPORTS] Store performance generated - StoreID: ${storeId}`);

    return {
      store: {
        id: store.id,
        name: store.name,
        code: store.code,
      },
      period: filters.period || 'CUSTOM',
      metrics: {
        // TODO: Implementar com tabela de appointments/service_orders
        appointmentsScheduled: 0,
        appointmentsCompleted: 0,
        appointmentsCancelled: 0,
        revenue: 0,
      },
    };
  }
}

