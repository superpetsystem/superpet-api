import { IsUUID, IsOptional, IsInt, IsEnum, IsString, IsArray, Min } from 'class-validator';
import { ServiceVisibility } from '../entities/service.entity';

export class CreateCustomServiceDto {
  @IsUUID('4', { message: 'serviceId deve ser um UUID válido' })
  serviceId: string;

  @IsOptional()
  @IsInt({ message: 'Preço deve ser um número inteiro em centavos' })
  @Min(0, { message: 'Preço não pode ser negativo' })
  priceOverrideCents?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  durationMinutesOverride?: number;

  @IsOptional()
  @IsEnum(ServiceVisibility)
  visibilityOverride?: ServiceVisibility;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  resourcesOverride?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  addonsOverride?: string[];

  @IsOptional()
  @IsString()
  localNotes?: string;
}




