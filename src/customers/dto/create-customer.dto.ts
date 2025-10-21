import { IsString, IsEmail, IsOptional, IsEnum, IsObject, Matches } from 'class-validator';
import { CustomerSource } from '../entities/customer.entity';

export class CreateCustomerDto {
  @IsString({ message: 'Nome é obrigatório' })
  name: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email inválido' })
  email?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+[1-9]\d{1,14}$/, { message: 'Telefone deve estar no formato E.164' })
  phone?: string;

  @IsOptional()
  @IsObject()
  marketingConsent?: {
    email?: boolean;
    sms?: boolean;
    whatsapp?: boolean;
  };

  @IsOptional()
  @IsEnum(CustomerSource)
  source?: CustomerSource;
}
