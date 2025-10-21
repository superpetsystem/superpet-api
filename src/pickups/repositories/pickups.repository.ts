import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { PickupEntity, PickupStatus } from '../entities/pickup.entity';

@Injectable()
export class PickupsRepository {
  constructor(
    @InjectRepository(PickupEntity)
    private readonly repository: Repository<PickupEntity>,
  ) {}

  async create(data: Partial<PickupEntity>): Promise<PickupEntity> {
    const pickup = this.repository.create(data);
    return this.repository.save(pickup);
  }

  async findById(id: string): Promise<PickupEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['customer', 'pet', 'store'],
    });
  }

  async findByStore(storeId: string, date?: string): Promise<PickupEntity[]> {
    const where: any = { storeId };

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      return this.repository.find({
        where: {
          storeId,
          pickupWindowStart: Between(startOfDay, endOfDay),
        },
        relations: ['customer', 'pet'],
        order: { pickupWindowStart: 'ASC' },
      });
    }

    return this.repository.find({
      where,
      relations: ['customer', 'pet'],
      order: { pickupWindowStart: 'DESC' },
    });
  }

  async countByStoreAndDate(storeId: string, date: string): Promise<number> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.repository.count({
      where: {
        storeId,
        pickupWindowStart: Between(startOfDay, endOfDay),
      },
    });
  }

  async updateStatus(id: string, status: PickupStatus): Promise<PickupEntity | null> {
    await this.repository.update(id, { status });
    return this.findById(id);
  }
}


