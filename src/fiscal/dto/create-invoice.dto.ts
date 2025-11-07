import { IsEnum, IsString, IsOptional, IsNumber, IsArray, ValidateNested, IsDate, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { InvoiceType, PaymentMethod } from '../entities/invoice.entity';

export class InvoiceItemDto {
  @IsString()
  id: string;

  @IsEnum(['PRODUCT', 'SERVICE'])
  type: 'PRODUCT' | 'SERVICE';

  @IsString()
  description: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unitValue: number;

  @IsNumber()
  totalValue: number;

  @IsNumber()
  taxRate: number;

  @IsNumber()
  taxValue: number;
}

export class CreateInvoiceDto {
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsEnum(InvoiceType)
  invoiceType: InvoiceType;

  @IsDate()
  @Type(() => Date)
  issuanceDate: Date;

  @IsNumber()
  totalAmount: number;

  @IsNumber()
  totalProducts: number;

  @IsNumber()
  totalServices: number;

  @IsOptional()
  @IsNumber()
  discount?: number;

  @IsOptional()
  @IsNumber()
  freight?: number;

  @IsNumber()
  totalTax: number;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];
}



