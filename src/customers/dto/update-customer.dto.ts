import { IsString, IsEmail, IsOptional, IsObject, Matches } from 'class-validator';

export class UpdateCustomerDto {
  @IsOptional()
  @IsString()
  name?: string;

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
}
