import { IsEmail, IsString, MinLength, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateAddressDto } from './create-address.dto';
import { CreatePersonDataDto } from './create-person-data.dto';

export class CreateCustomerDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @ValidateNested()
  @Type(() => CreateAddressDto)
  address: CreateAddressDto;

  @ValidateNested()
  @Type(() => CreatePersonDataDto)
  personData: CreatePersonDataDto;
}

