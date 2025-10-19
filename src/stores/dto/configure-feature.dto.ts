import { IsBoolean, IsOptional, IsObject } from 'class-validator';

export class ConfigureFeatureDto {
  @IsBoolean({ message: 'enabled deve ser um booleano' })
  enabled: boolean;

  @IsOptional()
  @IsObject()
  limits?: {
    dailyPickups?: number;
    [key: string]: any;
  };
}


