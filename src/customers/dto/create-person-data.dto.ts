import { IsString, IsEnum, IsDateString, IsOptional, IsEmail } from 'class-validator';
import { DocumentType } from '../entities/person-data.entity';

export class CreatePersonDataDto {
  @IsString()
  fullName: string;

  @IsEnum(DocumentType)
  documentType: DocumentType;

  @IsString()
  documentNumber: string;

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

