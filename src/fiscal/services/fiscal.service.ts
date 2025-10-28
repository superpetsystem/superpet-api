import { Injectable, Logger } from '@nestjs/common';
import { InvoiceRepository } from '../repositories/invoice.repository';
import { InvoiceEntity, InvoiceStatus, InvoiceType } from '../entities/invoice.entity';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import { UpdateInvoiceDto } from '../dto/update-invoice.dto';

@Injectable()
export class FiscalService {
  private readonly logger = new Logger(FiscalService.name);

  constructor(private invoiceRepository: InvoiceRepository) {}

  async createInvoice(storeId: string, dto: CreateInvoiceDto): Promise<InvoiceEntity> {
    this.logger.log(`Creating invoice for store ${storeId}`);

    // Get next sequential number
    const number = await this.invoiceRepository.getNextNumber(storeId);

    // Create invoice in database
    const invoice = await this.invoiceRepository.createInvoice({
      ...dto,
      storeId,
    });

    // Update invoice with number
    invoice.number = number;
    invoice.accessKey = this.generateAccessKey(invoice);
    await this.invoiceRepository.save(invoice);

    // Process invoice with external API (mocked for now)
    await this.processInvoiceExternal(invoice);

    return invoice;
  }

  async findById(id: string): Promise<InvoiceEntity | null> {
    return await this.invoiceRepository.findOne({
      where: { id },
      relations: ['customer', 'store'],
    });
  }

  async findByStore(storeId: string): Promise<InvoiceEntity[]> {
    return this.invoiceRepository.findByStore(storeId);
  }

  async findByCustomer(customerId: string): Promise<InvoiceEntity[]> {
    return this.invoiceRepository.findByCustomer(customerId);
  }

  async cancelInvoice(id: string, reason: string): Promise<InvoiceEntity> {
    this.logger.log(`Canceling invoice ${id}`);
    
    const invoice = await this.findById(id);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    // Cancel with external API
    await this.cancelInvoiceExternal(invoice, reason);

    // Update status
    await this.invoiceRepository.cancelInvoice(id, reason);

    const updated = await this.findById(id);
    if (!updated) {
      throw new Error('Invoice not found after cancellation');
    }
    return updated;
  }

  /**
   * Process invoice with external fiscal provider (MOCKED)
   * In the future, this will integrate with real providers like:
   * - NFe.js (free/open source)
   * - TecnoSpeed
   * - GerenciaNet
   * - Focus NFe
   * - etc.
   */
  private async processInvoiceExternal(invoice: InvoiceEntity): Promise<void> {
    this.logger.log(`Processing invoice ${invoice.id} with external API (MOCKED)`);

    // Simulate API delay
    await this.delay(1000);

    // Mock API response
    const mockResponse = {
      success: true,
      status: 'AUTHORIZED',
      accessKey: invoice.accessKey,
      protocol: `MOCK-PROTOCOL-${Date.now()}`,
      xmlUrl: `https://api.fiscal.mock/invoices/${invoice.accessKey}/xml`,
      danfeUrl: `https://api.fiscal.mock/invoices/${invoice.accessKey}/danfe`,
      date: new Date().toISOString(),
      provider: 'MOCKED_API',
    };

    // Update invoice status
    await this.invoiceRepository.updateStatus(
      invoice.id,
      InvoiceStatus.AUTHORIZED,
      mockResponse.protocol,
    );

    // Update invoice with URLs
    await this.invoiceRepository.update(invoice.id, {
      xmlUrl: mockResponse.xmlUrl,
      danfeUrl: mockResponse.danfeUrl,
      xmlContent: this.generateMockXML(invoice),
      metadata: {
        provider: 'MOCKED_API',
        integration: 'MOCKED',
        additionalNotes: 'This is a mocked fiscal integration for development. Replace with real provider in production.',
      },
    });

    this.logger.log(`Invoice ${invoice.id} authorized with protocol ${mockResponse.protocol}`);
  }

  /**
   * Cancel invoice with external fiscal provider (MOCKED)
   */
  private async cancelInvoiceExternal(invoice: InvoiceEntity, reason: string): Promise<void> {
    this.logger.log(`Canceling invoice ${invoice.accessKey} with external API (MOCKED)`);

    // Simulate API delay
    await this.delay(500);

    // Mock cancellation response
    const mockResponse = {
      success: true,
      protocol: `MOCK-CANCEL-${Date.now()}`,
      date: new Date().toISOString(),
    };

    this.logger.log(`Invoice ${invoice.accessKey} canceled with protocol ${mockResponse.protocol}`);
  }

  /**
   * Generate mock access key (NFe standard: 44 characters)
   */
  private generateAccessKey(invoice: InvoiceEntity): string {
    // Mock format: CO_UF + AA_MM + CNPJ + MODEL + SERIE + NUM + TP_EMIS + CNF
    // In production, this would use real federal standards
    const timestamp = Date.now().toString().padStart(14, '0');
    const random = Math.random().toString().substr(2, 10);
    return `55${timestamp}${random}`.substring(0, 44);
  }

  /**
   * Generate mock XML content
   */
  private generateMockXML(invoice: InvoiceEntity): any {
    return {
      id: `NFe${invoice.accessKey}`,
      ide: {
        cUF: '52',
        cNF: Math.random().toString().substr(2, 8),
        mod: invoice.invoiceType === InvoiceType.NF_E ? '55' : '65',
        serie: invoice.series,
        nNF: invoice.number,
        dhEmi: invoice.issuanceDate.toISOString(),
        tpNF: '1',
        idDest: '1',
        tpImp: '1',
        tpEmis: '1',
        cDV: '0',
        tpAmb: '2', // Homologação
      },
      total: {
        ICMSTot: {
          vBC: invoice.totalProducts,
          vICMS: invoice.totalTax,
          vProd: invoice.totalAmount,
          vNF: invoice.totalAmount,
        },
      },
      infAdic: {
        infCpl: 'Nota fiscal gerada pela API mockada para desenvolvimento',
      },
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}


