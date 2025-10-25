import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { CartItemEntity, CartItemType } from '../entities/cart-item.entity';

@Injectable()
export class CartItemRepository {
  constructor(
    @InjectRepository(CartItemEntity)
    private readonly repository: Repository<CartItemEntity>,
  ) {}

  async create(itemData: Partial<CartItemEntity>): Promise<CartItemEntity> {
    console.log('Creating cart item with data:', itemData);
    try {
      const item = this.repository.create(itemData);
      console.log('Created entity:', item);
      const saved = await this.repository.save(item);
      console.log('Saved item:', saved);
      return saved;
    } catch (error) {
      console.error('Error creating cart item:', error);
      throw error;
    }
  }

  async findById(id: string, organizationId: string): Promise<CartItemEntity | null> {
    return this.repository.findOne({
      where: { id, organizationId },
      // relations: ['cart', 'service', 'product'], // Temporarily disabled
    });
  }

  async findByCart(cartId: string, organizationId: string): Promise<CartItemEntity[]> {
    console.log('Finding items for cart:', cartId, 'org:', organizationId);
    try {
      // Use raw query to avoid TypeORM issues
      const items = await this.repository.query(
        'SELECT * FROM cart_items WHERE cartId = ? AND organizationId = ? ORDER BY created_at ASC',
        [cartId, organizationId]
      );
      console.log('Found items:', items.length);
      return items;
    } catch (error) {
      console.error('Error finding items:', error);
      throw error;
    }
  }

  async findByService(serviceId: string, organizationId: string): Promise<CartItemEntity[]> {
    return this.repository.find({
      where: { serviceId, organizationId },
      relations: ['cart', 'service'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByProduct(productId: string, organizationId: string): Promise<CartItemEntity[]> {
    return this.repository.find({
      where: { productId, organizationId },
      relations: ['cart', 'product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByType(itemType: CartItemType, organizationId: string): Promise<CartItemEntity[]> {
    return this.repository.find({
      where: { type: itemType, organizationId },
      // relations: ['cart', 'service', 'product'], // Temporarily disabled
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, organizationId: string, updateData: Partial<CartItemEntity>): Promise<CartItemEntity | null> {
    await this.repository.update({ id, organizationId }, updateData);
    return this.findById(id, organizationId);
  }

  async delete(id: string, organizationId: string): Promise<boolean> {
    const result = await this.repository.delete({ id, organizationId });
    return (result.affected || 0) > 0;
  }

  async deleteByCart(cartId: string, organizationId: string): Promise<boolean> {
    const result = await this.repository.delete({ cartId, organizationId });
    return (result.affected || 0) > 0;
  }

  async calculateItemTotal(item: CartItemEntity): Promise<number> {
    const subtotal = item.unitPrice * item.quantity;
    const discountAmount = item.discountAmount || 0;
    const taxAmount = item.taxAmount || 0;
    return Math.round((subtotal - discountAmount + taxAmount) * 100) / 100;
  }

  async updateItemTotal(itemId: string, organizationId: string): Promise<CartItemEntity | null> {
    const item = await this.findById(itemId, organizationId);
    if (!item) return null;

    const totalAmount = await this.calculateItemTotal(item);
    return this.update(itemId, organizationId, { totalAmount });
  }

  async findWithFilters(
    organizationId: string,
    filters: {
      cartId?: string;
      storeId?: string;
      itemType?: CartItemType;
      serviceId?: string;
      productId?: string;
      startDate?: Date;
      endDate?: Date;
    },
  ): Promise<CartItemEntity[]> {
    const where: FindOptionsWhere<CartItemEntity> = { organizationId };

    if (filters.cartId) where.cartId = filters.cartId;
    if (filters.storeId) where.storeId = filters.storeId;
    if (filters.itemType) where.type = filters.itemType;
    if (filters.serviceId) where.serviceId = filters.serviceId;
    if (filters.productId) where.productId = filters.productId;

    const query = this.repository.createQueryBuilder('item')
      .leftJoinAndSelect('item.cart', 'cart')
      .leftJoinAndSelect('item.service', 'service')
      .leftJoinAndSelect('item.product', 'product')
      .where('item.organizationId = :organizationId', { organizationId });

    if (filters.cartId) {
      query.andWhere('item.cartId = :cartId', { cartId: filters.cartId });
    }

    if (filters.storeId) {
      query.andWhere('item.storeId = :storeId', { storeId: filters.storeId });
    }

    if (filters.itemType) {
      query.andWhere('item.itemType = :itemType', { itemType: filters.itemType });
    }

    if (filters.serviceId) {
      query.andWhere('item.serviceId = :serviceId', { serviceId: filters.serviceId });
    }

    if (filters.productId) {
      query.andWhere('item.productId = :productId', { productId: filters.productId });
    }

    if (filters.startDate) {
      query.andWhere('item.createdAt >= :startDate', { startDate: filters.startDate });
    }

    if (filters.endDate) {
      query.andWhere('item.createdAt <= :endDate', { endDate: filters.endDate });
    }

    return query
      .orderBy('item.createdAt', 'DESC')
      .getMany();
  }
}
