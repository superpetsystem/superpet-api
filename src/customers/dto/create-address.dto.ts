import { IsString, IsBoolean, IsOptional, Length, Matches } from 'class-validator';

export class CreateAddressDto {
  @IsString({ message: 'Rua é obrigatória' })
  street: string;

  @IsOptional()
  @IsString()
  number?: string;

  @IsOptional()
  @IsString()
  complement?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsString({ message: 'Cidade é obrigatória' })
  city: string;

  @IsString({ message: 'Estado é obrigatório' })
  @Length(2, 2, { message: 'Estado deve ter 2 caracteres (UF)' })
  state: string;

  @IsString({ message: 'CEP é obrigatório' })
  @Matches(/^\d{8}$/, { message: 'CEP deve ter 8 dígitos (apenas números)' })
  zip: string;

  @IsOptional()
  @IsString()
  @Length(2, 2)
  country?: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
