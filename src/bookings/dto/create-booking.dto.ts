import { IsUUID, IsNotEmpty, IsDateString, IsString, IsOptional, IsInt, Min } from 'class-validator';

export class CreateBookingDto {
  @IsUUID('all')
  @IsNotEmpty()
  storeId: string;

  @IsUUID('all')
  @IsNotEmpty()
  customerId: string;

  @IsUUID('all')
  @IsOptional()
  petId?: string;

  @IsUUID('all')
  @IsNotEmpty()
  serviceId: string;

  @IsUUID('all')
  @IsOptional()
  employeeId?: string;

  @IsDateString()
  @IsNotEmpty()
  bookingDate: string;

  @IsString()
  @IsNotEmpty()
  startTime: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

