import { IsString, IsOptional, IsObject, IsArray, IsBoolean, Length } from 'class-validator';

export class CreateStoreDto {
  @IsString({ message: 'Código é obrigatório' })
  @Length(1, 50)
  code: string;

  @IsString({ message: 'Nome é obrigatório' })
  name: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsObject()
  address?: {
    street: string;
    number?: string;
    district?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };

  @IsOptional()
  @IsObject()
  openingHours?: {
    mon?: string[][];
    tue?: string[][];
    wed?: string[][];
    thu?: string[][];
    fri?: string[][];
    sat?: string[][];
    sun?: string[][];
  };

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  resourcesCatalog?: string[];

  @IsOptional()
  @IsObject()
  capacity?: { [key: string]: number };

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
