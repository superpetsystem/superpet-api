import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { TransactionEntity, PaymentMethod, TransactionStatus } from '../entities/transaction.entity';

@Injectable()
export class TransactionRepository {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly repository: Repository<TransactionEntity>,
  ) {}

  async create(transactionData: Partial<TransactionEntity>): Promise<TransactionEntity> {
    const transaction = this.repository.create(transactionData);
    return this.repository.save(transaction);
  }

  async findById(id: string, organizationId: string): Promise<TransactionEntity | null> {
    return this.repository.findOne({
      where: { id, organizationId },
      relations: ['cart'],
    });
  }

  async findByTransactionNumber(transactionNumber: string, organizationId: string): Promise<TransactionEntity | null> {
    return this.repository.findOne({
      where: { transactionNumber, organizationId },
      relations: ['cart'],
    });
  }

  async findByCart(cartId: string, organizationId: string): Promise<TransactionEntity[]> {
    return this.repository.find({
      where: { cartId, organizationId },
      relations: ['cart'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByStore(storeId: string, organizationId: string): Promise<TransactionEntity[]> {
    return this.repository.find({
      where: { storeId, organizationId },
      relations: ['cart'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByEmployee(employeeId: string, organizationId: string): Promise<TransactionEntity[]> {
    return this.repository.find({
      where: { employeeId, organizationId },
      relations: ['cart'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByPaymentMethod(paymentMethod: PaymentMethod, organizationId: string): Promise<TransactionEntity[]> {
    return this.repository.find({
      where: { paymentMethod, organizationId },
      relations: ['cart'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByStatus(status: TransactionStatus, organizationId: string): Promise<TransactionEntity[]> {
    return this.repository.find({
      where: { status, organizationId },
      relations: ['cart'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, organizationId: string, updateData: Partial<TransactionEntity>): Promise<TransactionEntity | null> {
    await this.repository.update({ id, organizationId }, updateData);
    return this.findById(id, organizationId);
  }

  async delete(id: string, organizationId: string): Promise<boolean> {
    const result = await this.repository.delete({ id, organizationId });
    return (result.affected || 0) > 0;
  }

  async generateTransactionNumber(storeId: string): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    
    // Find the last transaction number for today
    const lastTransaction = await this.repository.findOne({
      where: { storeId },
      order: { createdAt: 'DESC' },
    });

    let sequence = 1;
    if (lastTransaction && lastTransaction.transactionNumber.includes(dateStr)) {
      const lastSequence = parseInt(lastTransaction.transactionNumber.slice(-4));
      sequence = lastSequence + 1;
    }

    return `TXN${dateStr}${sequence.toString().padStart(4, '0')}`;
  }

  async getTotalByPaymentMethod(
    paymentMethod: PaymentMethod,
    organizationId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<number> {
    const query = this.repository.createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'total')
      .where('transaction.organizationId = :organizationId', { organizationId })
      .andWhere('transaction.paymentMethod = :paymentMethod', { paymentMethod })
      .andWhere('transaction.status = :status', { status: TransactionStatus.COMPLETED });

    if (startDate) {
      query.andWhere('transaction.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('transaction.createdAt <= :endDate', { endDate });
    }

    const result = await query.getRawOne();
    return parseFloat(result.total) || 0;
  }

  async getDailySales(storeId: string, organizationId: string, date: Date): Promise<{
    totalAmount: number;
    transactionCount: number;
    paymentMethods: Record<PaymentMethod, number>;
  }> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const transactions = await this.repository
      .createQueryBuilder('transaction')
      .where('transaction.storeId = :storeId', { storeId })
      .andWhere('transaction.organizationId = :organizationId', { organizationId })
      .andWhere('transaction.status = :status', { status: TransactionStatus.COMPLETED })
      .andWhere('transaction.createdAt >= :startOfDay', { startOfDay })
      .andWhere('transaction.createdAt <= :endOfDay', { endOfDay })
      .getMany();

    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
    const transactionCount = transactions.length;
    
    const paymentMethods = transactions.reduce((acc, t) => {
      acc[t.paymentMethod] = (acc[t.paymentMethod] || 0) + t.amount;
      return acc;
    }, {} as Record<PaymentMethod, number>);

    return {
      totalAmount: Math.round(totalAmount * 100) / 100,
      transactionCount,
      paymentMethods,
    };
  }

  async findWithFilters(
    organizationId: string,
    filters: {
      storeId?: string;
      employeeId?: string;
      paymentMethod?: PaymentMethod;
      status?: TransactionStatus;
      startDate?: Date;
      endDate?: Date;
    },
  ): Promise<TransactionEntity[]> {
    const where: FindOptionsWhere<TransactionEntity> = { organizationId };

    if (filters.storeId) where.storeId = filters.storeId;
    if (filters.employeeId) where.employeeId = filters.employeeId;
    if (filters.paymentMethod) where.paymentMethod = filters.paymentMethod;
    if (filters.status) where.status = filters.status;

    const query = this.repository.createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.cart', 'cart')
      .where('transaction.organizationId = :organizationId', { organizationId });

    if (filters.storeId) {
      query.andWhere('transaction.storeId = :storeId', { storeId: filters.storeId });
    }

    if (filters.employeeId) {
      query.andWhere('transaction.employeeId = :employeeId', { employeeId: filters.employeeId });
    }

    if (filters.paymentMethod) {
      query.andWhere('transaction.paymentMethod = :paymentMethod', { paymentMethod: filters.paymentMethod });
    }

    if (filters.status) {
      query.andWhere('transaction.status = :status', { status: filters.status });
    }

    if (filters.startDate) {
      query.andWhere('transaction.createdAt >= :startDate', { startDate: filters.startDate });
    }

    if (filters.endDate) {
      query.andWhere('transaction.createdAt <= :endDate', { endDate: filters.endDate });
    }

    return query
      .orderBy('transaction.createdAt', 'DESC')
      .getMany();
  }
}
