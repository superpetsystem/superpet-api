import { IsString, IsOptional, Length } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  @Length(8, 10)
  zipCode: string;

  @IsString()
  street: string;

  @IsString()
  number: string;

  @IsOptional()
  @IsString()
  complement?: string;

  @IsString()
  neighborhood: string;

  @IsString()
  city: string;

  @IsString()
  @Length(2, 2)
  state: string;

  @IsOptional()
  @IsString()
  country?: string;
}

