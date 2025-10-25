import { IsUUID, IsOptional, IsString, IsNumber, IsEnum, Min, Max } from 'class-validator';

export enum PaymentMethod {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  PIX = 'PIX',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CHECK = 'CHECK',
}

export class CreateTransactionDto {
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  changeAmount?: number;

  @IsString()
  @IsOptional()
  externalTransactionId?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class ProcessPaymentDto {
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  changeAmount?: number;

  @IsString()
  @IsOptional()
  externalTransactionId?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class RefundTransactionDto {
  @IsNumber()
  @Min(0)
  refundAmount: number;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
