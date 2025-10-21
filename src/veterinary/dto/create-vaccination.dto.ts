import { IsUUID, IsNotEmpty, IsDateString, IsString, IsOptional } from 'class-validator';

export class CreateVaccinationDto {
  @IsUUID()
  @IsNotEmpty()
  petId: string;

  @IsString()
  @IsNotEmpty()
  vaccineName: string;

  @IsString()
  @IsOptional()
  manufacturer?: string;

  @IsString()
  @IsOptional()
  batchNumber?: string;

  @IsDateString()
  @IsNotEmpty()
  applicationDate: string;

  @IsDateString()
  @IsOptional()
  nextDoseDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

