import { IsString, IsNotEmpty, IsEnum, IsOptional, IsInt, Min, IsNumber, IsBoolean } from 'class-validator';
import { ProductCategory, ProductUnit } from '../entities/product.entity';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ProductCategory)
  category: ProductCategory;

  @IsEnum(ProductUnit)
  @IsOptional()
  unit?: ProductUnit;

  @IsInt()
  @IsOptional()
  @Min(0)
  costPriceCents?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  salePriceCents?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  minStock?: number;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}

