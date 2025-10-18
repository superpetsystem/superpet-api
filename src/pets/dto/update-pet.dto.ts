import { IsString, IsEnum, IsDateString, IsNumber, IsOptional } from 'class-validator';
import { PetType, PetGender } from '../entities/pet.entity';

export class UpdatePetDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(PetType)
  type?: PetType;

  @IsOptional()
  @IsString()
  breed?: string;

  @IsOptional()
  @IsEnum(PetGender)
  gender?: PetGender;

  @IsOptional()
  @IsDateString()
  birthDate?: Date;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

