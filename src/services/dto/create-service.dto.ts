import { IsString, IsEnum, IsInt, IsOptional, IsArray, IsBoolean, Min, Max, Length } from 'class-validator';
import { ServiceVisibility } from '../entities/service.entity';

export class CreateServiceDto {
  @IsString({ message: 'Código é obrigatório' })
  @Length(1, 50)
  code: string;

  @IsString({ message: 'Nome é obrigatório' })
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt({ message: 'Duração deve ser um número inteiro' })
  @Min(1, { message: 'Duração mínima é 1 minuto' })
  @Max(480, { message: 'Duração máxima é 480 minutos (8 horas)' })
  durationMinutes: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(120)
  bufferBefore?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(120)
  bufferAfter?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  resourcesRequired?: string[];

  @IsOptional()
  @IsEnum(ServiceVisibility)
  visibility?: ServiceVisibility;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsInt({ message: 'Preço deve ser um número inteiro em centavos' })
  @Min(0, { message: 'Preço não pode ser negativo' })
  priceBaseCents: number;

  @IsOptional()
  @IsString()
  taxCode?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  addons?: string[];
}
