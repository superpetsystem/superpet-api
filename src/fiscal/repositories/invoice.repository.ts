import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InvoiceEntity, InvoiceStatus, InvoiceType } from '../entities/invoice.entity';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import { UpdateInvoiceDto } from '../dto/update-invoice.dto';

@Injectable()
export class InvoiceRepository extends Repository<InvoiceEntity> {
  constructor(private dataSource: DataSource) {
    super(InvoiceEntity, dataSource.createEntityManager());
  }

  async findByStore(storeId: string): Promise<InvoiceEntity[]> {
    return this.find({
      where: { storeId },
      relations: ['customer', 'store'],
      order: { issuanceDate: 'DESC' },
    });
  }

  async findByCustomer(customerId: string): Promise<InvoiceEntity[]> {
    return this.find({
      where: { customerId },
      relations: ['store'],
      order: { issuanceDate: 'DESC' },
    });
  }

  async findByStatus(status: InvoiceStatus): Promise<InvoiceEntity[]> {
    return this.find({
      where: { status },
      relations: ['customer', 'store'],
    });
  }

  async findByAccessKey(accessKey: string): Promise<InvoiceEntity | null> {
    return this.findOne({
      where: { accessKey },
      relations: ['customer', 'store'],
    });
  }

  async getNextNumber(storeId: string): Promise<number> {
    const lastInvoice = await this.findOne({
      where: { storeId },
      order: { number: 'DESC' },
    });

    return lastInvoice ? lastInvoice.number + 1 : 1;
  }

  async createInvoice(data: CreateInvoiceDto & { storeId: string }): Promise<InvoiceEntity> {
    const invoice = this.create({
      storeId: data.storeId,
      customerId: data.customerId,
      invoiceType: data.invoiceType,
      issuanceDate: data.issuanceDate,
      totalAmount: data.totalAmount,
      totalProducts: data.totalProducts,
      totalServices: data.totalServices,
      discount: data.discount,
      freight: data.freight,
      totalTax: data.totalTax,
      paymentMethod: data.paymentMethod,
      items: data.items,
      status: InvoiceStatus.PENDING,
      series: '001',
    });

    return invoice;
  }

  async updateStatus(id: string, status: InvoiceStatus, protocol?: string): Promise<void> {
    await this.update(id, {
      status,
      protocol,
      updatedAt: new Date(),
    });
  }

  async cancelInvoice(id: string, reason: string): Promise<void> {
    await this.update(id, {
      status: InvoiceStatus.CANCELED,
      deniedReason: reason,
      cancellationDate: new Date(),
    });
  }
}


