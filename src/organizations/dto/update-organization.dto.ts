import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';
import { OrganizationPlan } from './create-organization.dto';

export class UpdateOrganizationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(OrganizationPlan)
  plan?: OrganizationPlan;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
