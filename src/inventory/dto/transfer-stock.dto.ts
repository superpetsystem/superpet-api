import { IsUUID, IsNotEmpty, IsNumber, Min, IsString, IsOptional } from 'class-validator';

export class TransferStockDto {
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @IsUUID()
  @IsNotEmpty()
  fromStoreId: string;

  @IsUUID()
  @IsNotEmpty()
  toStoreId: string;

  @IsNumber()
  @Min(0.01)
  @IsNotEmpty()
  quantity: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

