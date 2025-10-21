import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class AdjustStockDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  newQuantity: number;

  @IsString()
  @IsOptional()
  reason?: string;
}

