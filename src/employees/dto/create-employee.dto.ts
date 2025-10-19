import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsArray, IsBoolean } from 'class-validator';
import { EmployeeRole, JobTitle } from '../entities/employee.entity';

export class CreateEmployeeDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsEnum(EmployeeRole)
  @IsNotEmpty()
  role: EmployeeRole;

  @IsEnum(JobTitle)
  @IsOptional()
  jobTitle?: JobTitle;

  @IsArray()
  @IsOptional()
  storeIds?: string[]; // Lojas às quais o employee terá acesso

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
