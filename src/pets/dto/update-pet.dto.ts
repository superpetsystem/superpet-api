import { IsString, IsOptional, IsNumber, IsArray, Min, Max, IsDateString } from 'class-validator';

export class UpdatePetDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  breed?: string;

  @IsOptional()
  @IsDateString()
  birthdate?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(200)
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
