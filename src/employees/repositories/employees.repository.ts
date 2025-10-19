import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { EmployeeEntity, EmployeeRole } from '../entities/employee.entity';
import { EmployeeStoreEntity } from '../entities/employee-store.entity';

@Injectable()
export class EmployeesRepository {
  constructor(
    @InjectRepository(EmployeeEntity)
    private readonly repository: Repository<EmployeeEntity>,
    @InjectRepository(EmployeeStoreEntity)
    private readonly employeeStoreRepository: Repository<EmployeeStoreEntity>,
  ) {}

  async create(data: Partial<EmployeeEntity>): Promise<EmployeeEntity> {
    const employee = this.repository.create(data);
    return this.repository.save(employee);
  }

  async findById(id: string): Promise<EmployeeEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['user', 'employeeStores', 'employeeStores.store'],
    });
  }

  async findByUserId(userId: string): Promise<EmployeeEntity | null> {
    return this.repository.findOne({
      where: { userId },
      relations: ['user', 'employeeStores', 'employeeStores.store'],
    });
  }

  async findByOrganization(
    organizationId: string,
    filters?: { storeId?: string; role?: EmployeeRole; jobTitle?: string; active?: boolean },
  ): Promise<EmployeeEntity[]> {
    const query = this.repository
      .createQueryBuilder('employee')
      .leftJoinAndSelect('employee.user', 'user')
      .leftJoinAndSelect('employee.employeeStores', 'employeeStores')
      .leftJoinAndSelect('employeeStores.store', 'store')
      .where('employee.organization_id = :organizationId', { organizationId });

    if (filters?.role) {
      query.andWhere('employee.role = :role', { role: filters.role });
    }

    if (filters?.jobTitle) {
      query.andWhere('employee.job_title = :jobTitle', { jobTitle: filters.jobTitle });
    }

    if (filters?.active !== undefined) {
      query.andWhere('employee.active = :active', { active: filters.active });
    }

    if (filters?.storeId) {
      query.andWhere('employeeStores.store_id = :storeId', { storeId: filters.storeId });
    }

    return query.getMany();
  }

  async checkStoreAccess(employeeId: string, storeId: string): Promise<boolean> {
    const count = await this.employeeStoreRepository.count({
      where: { employeeId, storeId },
    });
    return count > 0;
  }

  async linkStores(employeeId: string, storeIds: string[]): Promise<void> {
    // Remover vínculos antigos
    await this.employeeStoreRepository.delete({ employeeId });

    // Criar novos vínculos
    const links = storeIds.map((storeId) =>
      this.employeeStoreRepository.create({ employeeId, storeId }),
    );
    await this.employeeStoreRepository.save(links);
  }

  async update(id: string, data: Partial<EmployeeEntity>): Promise<EmployeeEntity | null> {
    await this.repository.update(id, data);
    return this.findById(id);
  }
}
