import { IsString, IsNotEmpty, IsObject, IsOptional, IsArray } from 'class-validator';

export class CreateStoreDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  timezone: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsObject()
  @IsOptional()
  address?: any;

  @IsObject()
  @IsNotEmpty()
  openingHours: any;

  @IsArray()
  @IsOptional()
  resourcesCatalog?: string[];

  @IsObject()
  @IsOptional()
  capacity?: any;
}




