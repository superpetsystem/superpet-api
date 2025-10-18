import { IsString, IsEnum, IsDateString, IsOptional, IsEmail } from 'class-validator';
import { DocumentType } from '../entities/person-data.entity';

export class UpdatePersonDataDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsEnum(DocumentType)
  documentType?: DocumentType;

  @IsOptional()
  @IsString()
  documentNumber?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: Date;

  @IsOptional()
  @IsString()
  phoneAlternative?: string;

  @IsOptional()
  @IsEmail()
  emailAlternative?: string;
}

