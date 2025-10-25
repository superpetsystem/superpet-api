import { IsUUID, IsOptional, IsString, IsNumber, IsEnum, IsArray, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum CartItemType {
  SERVICE = 'SERVICE',
  PRODUCT = 'PRODUCT',
}

export class CreateCartItemDto {
  @IsEnum(CartItemType)
  itemType: CartItemType;

  @IsUUID()
  @IsOptional()
  serviceId?: string;

  @IsUUID()
  @IsOptional()
  productId?: string;

  @IsString()
  itemName: string;

  @IsString()
  @IsOptional()
  itemCode?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(1)
  @Max(999)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitPrice: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  discountAmount?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  taxAmount?: number;
}

export class CreateCartDto {
  @IsUUID()
  storeId: string;

  @IsUUID()
  @IsOptional()
  customerId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCartItemDto)
  @IsOptional()
  items?: CreateCartItemDto[];

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateCartDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCartItemDto)
  @IsOptional()
  items?: CreateCartItemDto[];

  @IsString()
  @IsOptional()
  notes?: string;
}

export class AddItemToCartDto {
  @IsEnum(CartItemType)
  itemType: CartItemType;

  @IsUUID()
  @IsOptional()
  serviceId?: string;

  @IsUUID()
  @IsOptional()
  productId?: string;

  @IsString()
  itemName: string;

  @IsString()
  @IsOptional()
  itemCode?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(1)
  @Max(999)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitPrice: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  discountAmount?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  taxAmount?: number;
}

export class UpdateCartItemDto {
  @IsNumber()
  @Min(1)
  @Max(999)
  @IsOptional()
  quantity?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  unitPrice?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  discountAmount?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  taxAmount?: number;
}
