import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { StoreEntity } from '../../stores/entities/store.entity';
import { CustomerEntity } from '../../customers/entities/customer.entity';

export enum InvoiceType {
  NFC_E = 'NFC_E',     // Nota Fiscal de Consumidor Eletrônica
  NF_E = 'NF_E',       // Nota Fiscal Eletrônica (para produtos)
  SAT_CF_E = 'SAT_CF_E', // Cupom Fiscal Eletrônico (via SAT)
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',               // Em elaboração
  PENDING = 'PENDING',           // Aguardando envio
  PROCESSING = 'PROCESSING',     // Processando na SEFAZ
  AUTHORIZED = 'AUTHORIZED',     // Autorizada
  DENIED = 'DENIED',             // Negada
  CANCELED = 'CANCELED',        // Cancelada
  CONTINGENCY = 'CONTINGENCY',  // Em contingência
}

export enum PaymentMethod {
  CASH = 'CASH',
  DEBIT_CARD = 'DEBIT_CARD',
  CREDIT_CARD = 'CREDIT_CARD',
  PIX = 'PIX',
  BANK_SLIP = 'BANK_SLIP',
}

@Entity('invoices')
export class InvoiceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'store_id' })
  storeId: string;

  @ManyToOne(() => StoreEntity)
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity;

  @Column({ name: 'customer_id', nullable: true })
  customerId: string;

  @ManyToOne(() => CustomerEntity, { nullable: true })
  @JoinColumn({ name: 'customer_id' })
  customer: CustomerEntity;

  @Column({
    name: 'invoice_type',
    type: 'enum',
    enum: InvoiceType,
    default: InvoiceType.NFC_E,
  })
  invoiceType: InvoiceType;

  @Column({
    name: 'status',
    type: 'enum',
    enum: InvoiceStatus,
    default: InvoiceStatus.DRAFT,
  })
  status: InvoiceStatus;

  @Column({ name: 'access_key', unique: true, nullable: true })
  accessKey: string; // Chave de acesso NFe (44 dígitos)

  @Column({ name: 'number', type: 'int', unique: true })
  number: number; // Número sequencial da nota

  @Column({ name: 'series', type: 'varchar', length: 3, default: '001' })
  series: string;

  @Column({ name: 'issuance_date', type: 'datetime' })
  issuanceDate: Date;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ name: 'total_products', type: 'decimal', precision: 10, scale: 2 })
  totalProducts: number;

  @Column({ name: 'total_services', type: 'decimal', precision: 10, scale: 2 })
  totalServices: number;

  @Column({ name: 'discount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount: number;

  @Column({ name: 'freight', type: 'decimal', precision: 10, scale: 2, default: 0 })
  freight: number;

  @Column({ name: 'total_tax', type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalTax: number;

  @Column({ name: 'payment_method', type: 'enum', enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @Column({ type: 'json', nullable: true })
  items: {
    id: string;
    type: 'PRODUCT' | 'SERVICE';
    description: string;
    quantity: number;
    unitValue: number;
    totalValue: number;
    taxRate: number;
    taxValue: number;
  }[];

  @Column({ type: 'json', nullable: true })
  xmlContent: any; // Conteúdo XML da NFe

  @Column({ name: 'xml_url', nullable: true })
  xmlUrl: string; // URL para download do XML

  @Column({ name: 'danfe_url', nullable: true })
  danfeUrl: string; // URL para impressão DANFE

  @Column({ name: 'protocol', nullable: true })
  protocol: string; // Protocolo de autorização da SEFAZ

  @Column({ name: 'denied_reason', nullable: true, type: 'text' })
  deniedReason: string; // Motivo da negativa

  @Column({ name: 'cancellation_date', nullable: true, type: 'datetime' })
  cancellationDate: Date;

  @Column({ name: 'contingency', type: 'boolean', default: false })
  contingency: boolean;

  @Column({ type: 'json', nullable: true })
  contingencyData: {
    reason: string;
    date: Date;
  } | null;

  @Column({ type: 'json', nullable: true })
  metadata: {
    provider?: string; // Provedor fiscal usado (futuro)
    integration?: string; // Integração atual
    additionalNotes?: string;
  } | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}


