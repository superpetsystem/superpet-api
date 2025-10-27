import { IsUUID, IsOptional, IsString, IsNumber, IsEnum, Min, Max } from 'class-validator';

export enum ReceiptType {
  SALE = 'SALE',
  REFUND = 'REFUND',
  EXCHANGE = 'EXCHANGE',
}

export class CreateReceiptDto {
  @IsEnum(ReceiptType)
  @IsOptional()
  type?: ReceiptType;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class GenerateReceiptDto {
  @IsEnum(ReceiptType)
  @IsOptional()
  type?: ReceiptType;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  customerEmail?: string;

  @IsString()
  @IsOptional()
  customerPhone?: string;
}
