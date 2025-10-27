import { IsBoolean, IsObject, IsOptional } from 'class-validator';

export class EnableFeatureDto {
  @IsBoolean()
  enabled: boolean;

  @IsObject()
  @IsOptional()
  limits?: any;
}




