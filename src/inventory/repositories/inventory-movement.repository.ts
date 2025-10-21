import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryMovementEntity, MovementType } from '../entities/inventory-movement.entity';

@Injectable()
export class InventoryMovementRepository {
  constructor(
    @InjectRepository(InventoryMovementEntity)
    private readonly repository: Repository<InventoryMovementEntity>,
  ) {}

  async create(data: Partial<InventoryMovementEntity>): Promise<InventoryMovementEntity> {
    const movement = this.repository.create(data);
    return this.repository.save(movement);
  }

  async findByStore(
    storeId: string,
    filters?: { productId?: string; type?: MovementType; startDate?: Date; endDate?: Date },
  ): Promise<InventoryMovementEntity[]> {
    const query = this.repository
      .createQueryBuilder('movement')
      .leftJoinAndSelect('movement.product', 'product')
      .leftJoinAndSelect('movement.employee', 'employee')
      .where('movement.store_id = :storeId', { storeId })
      .orderBy('movement.created_at', 'DESC');

    if (filters?.productId) {
      query.andWhere('movement.product_id = :productId', { productId: filters.productId });
    }

    if (filters?.type) {
      query.andWhere('movement.type = :type', { type: filters.type });
    }

    if (filters?.startDate) {
      query.andWhere('movement.created_at >= :startDate', { startDate: filters.startDate });
    }

    if (filters?.endDate) {
      query.andWhere('movement.created_at <= :endDate', { endDate: filters.endDate });
    }

    return query.getMany();
  }

  async findByProduct(productId: string, limit: number = 50): Promise<InventoryMovementEntity[]> {
    return this.repository.find({
      where: { productId },
      relations: ['store', 'employee'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}

