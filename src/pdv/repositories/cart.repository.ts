import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { CartEntity, CartStatus } from '../entities/cart.entity';

@Injectable()
export class CartRepository {
  constructor(
    @InjectRepository(CartEntity)
    private readonly repository: Repository<CartEntity>,
  ) {}

  async create(cartData: Partial<CartEntity>): Promise<CartEntity> {
    console.log('Creating cart with data:', cartData);
    const cart = this.repository.create(cartData);
    console.log('Created cart entity:', cart);
    const saved = await this.repository.save(cart);
    console.log('Saved cart:', saved);
    return saved;
  }

  async findById(id: string, organizationId: string): Promise<CartEntity | null> {
    return this.repository.findOne({
      where: { id, organizationId },
      // relations: ['items', 'customer', 'store', 'transactions'], // Temporarily disabled
    });
  }

  async findByStore(storeId: string, organizationId: string): Promise<CartEntity[]> {
    return this.repository.find({
      where: { storeId, organizationId },
      // relations: ['items', 'customer', 'store'], // Temporarily disabled
      order: { createdAt: 'DESC' },
    });
  }

  async findByCustomer(customerId: string, organizationId: string): Promise<CartEntity[]> {
    return this.repository.find({
      where: { customerId, organizationId },
      relations: ['items', 'store'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByEmployee(employeeId: string, organizationId: string): Promise<CartEntity[]> {
    return this.repository.find({
      where: { employeeId, organizationId },
      // relations: ['items', 'customer', 'store'], // Temporarily disabled
      order: { createdAt: 'DESC' },
    });
  }

  async findByStatus(status: CartStatus, organizationId: string): Promise<CartEntity[]> {
    return this.repository.find({
      where: { status, organizationId },
      // relations: ['items', 'customer', 'store'], // Temporarily disabled
      order: { createdAt: 'DESC' },
    });
  }

  async findActiveByStore(storeId: string, organizationId: string): Promise<CartEntity[]> {
    return this.repository.find({
      where: { 
        storeId, 
        organizationId, 
        status: CartStatus.OPEN 
      },
      relations: ['items', 'customer'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, organizationId: string, updateData: Partial<CartEntity>): Promise<CartEntity | null> {
    await this.repository.update({ id, organizationId }, updateData);
    return this.findById(id, organizationId);
  }

  async delete(id: string, organizationId: string): Promise<boolean> {
    const result = await this.repository.delete({ id, organizationId });
    return (result.affected || 0) > 0;
  }

  async calculateTotals(cartId: string, organizationId: string): Promise<{
    subtotal: number;
    discountAmount: number;
    taxAmount: number;
    totalAmount: number;
  }> {
    // Use raw query to avoid TypeORM relation issues
    const items = await this.repository.query(
      'SELECT * FROM cart_items WHERE cartId = ? AND organizationId = ?',
      [cartId, organizationId]
    );

    let subtotal = 0;
    let discountAmount = 0;
    let taxAmount = 0;

    for (const item of items) {
      const itemSubtotal = parseFloat(item.unitPrice) * item.quantity;
      subtotal += itemSubtotal;
      discountAmount += parseFloat(item.discountAmount || 0);
      taxAmount += parseFloat(item.taxAmount || 0);
    }

    const totalAmount = subtotal - discountAmount + taxAmount;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      discountAmount: Math.round(discountAmount * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
    };
  }

  async updateTotals(cartId: string, organizationId: string): Promise<CartEntity | null> {
    const totals = await this.calculateTotals(cartId, organizationId);
    return this.update(cartId, organizationId, totals);
  }

  async findWithFilters(
    organizationId: string,
    filters: {
      storeId?: string;
      customerId?: string;
      employeeId?: string;
      status?: CartStatus;
      startDate?: Date;
      endDate?: Date;
    },
  ): Promise<CartEntity[]> {
    const where: FindOptionsWhere<CartEntity> = { organizationId };

    if (filters.storeId) where.storeId = filters.storeId;
    if (filters.customerId) where.customerId = filters.customerId;
    if (filters.employeeId) where.employeeId = filters.employeeId;
    if (filters.status) where.status = filters.status;

    const query = this.repository.createQueryBuilder('cart')
      // .leftJoinAndSelect('cart.items', 'items') // Temporarily disabled
      // .leftJoinAndSelect('cart.customer', 'customer') // Temporarily disabled
      // .leftJoinAndSelect('cart.store', 'store') // Temporarily disabled
      .where('cart.organizationId = :organizationId', { organizationId });

    if (filters.storeId) {
      query.andWhere('cart.storeId = :storeId', { storeId: filters.storeId });
    }

    if (filters.customerId) {
      query.andWhere('cart.customerId = :customerId', { customerId: filters.customerId });
    }

    if (filters.employeeId) {
      query.andWhere('cart.employeeId = :employeeId', { employeeId: filters.employeeId });
    }

    if (filters.status) {
      query.andWhere('cart.status = :status', { status: filters.status });
    }

    if (filters.startDate) {
      query.andWhere('cart.createdAt >= :startDate', { startDate: filters.startDate });
    }

    if (filters.endDate) {
      query.andWhere('cart.createdAt <= :endDate', { endDate: filters.endDate });
    }

    return query
      .orderBy('cart.createdAt', 'DESC')
      .getMany();
  }
}
