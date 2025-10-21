import { IsString, IsEnum, IsOptional, IsNumber, IsArray, Min, Max, IsDateString } from 'class-validator';
import { PetSpecies } from '../entities/pet.entity';

export class CreatePetDto {
  @IsString({ message: 'Nome é obrigatório' })
  name: string;

  @IsEnum(PetSpecies, { message: 'Espécie inválida' })
  species: PetSpecies;

  @IsOptional()
  @IsString()
  breed?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Data de nascimento inválida' })
  birthdate?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Peso deve ser numérico' })
  @Min(0, { message: 'Peso não pode ser negativo' })
  @Max(200, { message: 'Peso máximo é 200kg' })
  weightKg?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergies?: string[];

  @IsOptional()
  @IsString()
  microchip?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
