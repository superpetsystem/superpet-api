import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { ReceiptEntity, ReceiptType } from '../entities/receipt.entity';

@Injectable()
export class ReceiptRepository {
  constructor(
    @InjectRepository(ReceiptEntity)
    private readonly repository: Repository<ReceiptEntity>,
  ) {}

  async create(receiptData: Partial<ReceiptEntity>): Promise<ReceiptEntity> {
    const receipt = this.repository.create(receiptData);
    return this.repository.save(receipt);
  }

  async findById(id: string, organizationId: string): Promise<ReceiptEntity | null> {
    return this.repository.findOne({
      where: { id, organizationId },
      relations: ['cart'],
    });
  }

  async findByReceiptNumber(receiptNumber: string, organizationId: string): Promise<ReceiptEntity | null> {
    return this.repository.findOne({
      where: { receiptNumber, organizationId },
      relations: ['cart'],
    });
  }

  async findByCart(cartId: string, organizationId: string): Promise<ReceiptEntity[]> {
    return this.repository.find({
      where: { cartId, organizationId },
      relations: ['cart'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByStore(storeId: string, organizationId: string): Promise<ReceiptEntity[]> {
    return this.repository.find({
      where: { storeId, organizationId },
      relations: ['cart'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByType(type: ReceiptType, organizationId: string): Promise<ReceiptEntity[]> {
    return this.repository.find({
      where: { type, organizationId },
      relations: ['cart'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, organizationId: string, updateData: Partial<ReceiptEntity>): Promise<ReceiptEntity | null> {
    await this.repository.update({ id, organizationId }, updateData);
    return this.findById(id, organizationId);
  }

  async delete(id: string, organizationId: string): Promise<boolean> {
    const result = await this.repository.delete({ id, organizationId });
    return (result.affected || 0) > 0;
  }

  async generateReceiptNumber(storeId: string): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    
    // Find the last receipt number for today
    const lastReceipt = await this.repository.findOne({
      where: { storeId },
      order: { createdAt: 'DESC' },
    });

    let sequence = 1;
    if (lastReceipt && lastReceipt.receiptNumber.includes(dateStr)) {
      const lastSequence = parseInt(lastReceipt.receiptNumber.slice(-4));
      sequence = lastSequence + 1;
    }

    return `RCP${dateStr}${sequence.toString().padStart(4, '0')}`;
  }

  async getDailyReceipts(storeId: string, organizationId: string, date: Date): Promise<{
    totalAmount: number;
    receiptCount: number;
    types: Record<ReceiptType, number>;
  }> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const receipts = await this.repository
      .createQueryBuilder('receipt')
      .where('receipt.storeId = :storeId', { storeId })
      .andWhere('receipt.organizationId = :organizationId', { organizationId })
      .andWhere('receipt.createdAt >= :startOfDay', { startOfDay })
      .andWhere('receipt.createdAt <= :endOfDay', { endOfDay })
      .getMany();

    const totalAmount = receipts.reduce((sum, r) => sum + r.totalAmount, 0);
    const receiptCount = receipts.length;
    
    const types = receipts.reduce((acc, r) => {
      acc[r.type] = (acc[r.type] || 0) + r.totalAmount;
      return acc;
    }, {} as Record<ReceiptType, number>);

    return {
      totalAmount: Math.round(totalAmount * 100) / 100,
      receiptCount,
      types,
    };
  }

  async findWithFilters(
    organizationId: string,
    filters: {
      storeId?: string;
      type?: ReceiptType;
      startDate?: Date;
      endDate?: Date;
    },
  ): Promise<ReceiptEntity[]> {
    const where: FindOptionsWhere<ReceiptEntity> = { organizationId };

    if (filters.storeId) where.storeId = filters.storeId;
    if (filters.type) where.type = filters.type;

    const query = this.repository.createQueryBuilder('receipt')
      .leftJoinAndSelect('receipt.cart', 'cart')
      .where('receipt.organizationId = :organizationId', { organizationId });

    if (filters.storeId) {
      query.andWhere('receipt.storeId = :storeId', { storeId: filters.storeId });
    }

    if (filters.type) {
      query.andWhere('receipt.type = :type', { type: filters.type });
    }

    if (filters.startDate) {
      query.andWhere('receipt.createdAt >= :startDate', { startDate: filters.startDate });
    }

    if (filters.endDate) {
      query.andWhere('receipt.createdAt <= :endDate', { endDate: filters.endDate });
    }

    return query
      .orderBy('receipt.createdAt', 'DESC')
      .getMany();
  }
}
