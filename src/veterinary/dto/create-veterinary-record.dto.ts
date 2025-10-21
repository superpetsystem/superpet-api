import { IsUUID, IsNotEmpty, IsEnum, IsDateString, IsString, IsOptional, IsNumber, IsObject } from 'class-validator';
import { RecordType } from '../entities/veterinary-record.entity';

export class CreateVeterinaryRecordDto {
  @IsUUID()
  @IsNotEmpty()
  petId: string;

  @IsUUID()
  @IsNotEmpty()
  storeId: string;

  @IsUUID()
  @IsNotEmpty()
  veterinarianId: string;

  @IsEnum(RecordType)
  @IsNotEmpty()
  type: RecordType;

  @IsDateString()
  @IsNotEmpty()
  visitDate: string;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsString()
  @IsOptional()
  symptoms?: string;

  @IsString()
  @IsOptional()
  diagnosis?: string;

  @IsString()
  @IsOptional()
  treatment?: string;

  @IsObject()
  @IsOptional()
  prescriptions?: any;

  @IsNumber()
  @IsOptional()
  weightKg?: number;

  @IsNumber()
  @IsOptional()
  temperatureCelsius?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

