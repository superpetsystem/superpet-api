import { IsString, IsOptional, IsEnum, IsDateString, Matches, Length } from 'class-validator';
import { Gender } from '../entities/person-data.entity';

export class CreatePersonDataDto {
  @IsOptional()
  @IsString()
  @Matches(/^\d{11}$/, { message: 'CPF deve ter 11 dígitos (apenas números)' })
  cpf?: string;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  rg?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  issuer?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Data de nascimento inválida' })
  birthdate?: string;

  @IsOptional()
  @IsEnum(Gender, { message: 'Gênero inválido' })
  gender?: Gender;

  @IsOptional()
  @IsString()
  guardianName?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+[1-9]\d{1,14}$/, { message: 'Telefone deve estar no formato E.164' })
  guardianPhone?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
