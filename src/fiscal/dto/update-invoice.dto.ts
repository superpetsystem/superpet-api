import { IsOptional, IsString, IsEnum } from 'class-validator';
import { InvoiceStatus } from '../entities/invoice.entity';

export class UpdateInvoiceDto {
  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  @IsOptional()
  @IsString()
  protocol?: string;

  @IsOptional()
  @IsString()
  deniedReason?: string;
}


