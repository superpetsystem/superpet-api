import { IsString, IsNotEmpty, IsEnum, IsNumber, Min, IsOptional, IsInt } from 'class-validator';
import { MovementType } from '../entities/inventory-movement.entity';

export class CreateMovementDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsEnum(MovementType)
  type: MovementType;

  @IsNumber()
  @Min(0.01)
  quantity: number;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsString()
  @IsOptional()
  referenceType?: string;

  @IsString()
  @IsOptional()
  referenceId?: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  costPriceCents?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

