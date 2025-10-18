import { IsString, IsEnum, IsDateString, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { PetType, PetGender } from '../entities/pet.entity';

export class CreatePetDto {
  @IsString()
  name: string;

  @IsEnum(PetType)
  type: PetType;

  @IsString()
  breed: string;

  @IsEnum(PetGender)
  gender: PetGender;

  @IsDateString()
  birthDate: Date;

  @IsNumber()
  weight: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsUUID()
  customerId: string;
}

