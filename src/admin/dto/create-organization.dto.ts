import { IsString, IsNotEmpty, IsEnum, IsOptional, IsObject } from 'class-validator';
import { OrganizationPlan } from '../../organizations/entities/organization.entity';

export class CreateOrganizationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsEnum(OrganizationPlan)
  @IsOptional()
  plan?: OrganizationPlan;

  @IsObject()
  @IsOptional()
  limits?: any;
}






