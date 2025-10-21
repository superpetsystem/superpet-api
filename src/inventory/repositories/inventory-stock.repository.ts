import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { InventoryStockEntity } from '../entities/inventory-stock.entity';

@Injectable()
export class InventoryStockRepository {
  constructor(
    @InjectRepository(InventoryStockEntity)
    private readonly repository: Repository<InventoryStockEntity>,
  ) {}

  async findByStoreAndProduct(storeId: string, productId: string): Promise<InventoryStockEntity | null> {
    return this.repository.findOne({
      where: { storeId, productId },
      relations: ['product'],
    });
  }

  async findByStore(storeId: string): Promise<InventoryStockEntity[]> {
    return this.repository.find({
      where: { storeId },
      relations: ['product'],
      order: { product: { name: 'ASC' } },
    });
  }

  async findLowStock(storeId: string): Promise<InventoryStockEntity[]> {
    return this.repository
      .createQueryBuilder('stock')
      .leftJoinAndSelect('stock.product', 'product')
      .where('stock.store_id = :storeId', { storeId })
      .andWhere('stock.available < product.min_stock')
      .andWhere('product.active = true')
      .getMany();
  }

  async upsert(data: Partial<InventoryStockEntity>): Promise<InventoryStockEntity> {
    const existing = await this.findByStoreAndProduct(data.storeId!, data.productId!);
    
    if (existing) {
      await this.repository.update(existing.id, data);
      const updated = await this.findByStoreAndProduct(data.storeId!, data.productId!);
      return updated!;
    }

    const stock = this.repository.create(data);
    return this.repository.save(stock);
  }

  async updateQuantities(
    storeId: string,
    productId: string,
    quantity: number,
    reserved: number,
  ): Promise<void> {
    const available = quantity - reserved;
    
    await this.repository.update(
      { storeId, productId },
      {
        quantity,
        reserved,
        available,
      },
    );
  }
}

