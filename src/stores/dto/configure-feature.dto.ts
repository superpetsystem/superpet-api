import { IsBoolean, IsOptional, IsObject, IsString } from 'class-validator';

export class ConfigureFeatureDto {
  @IsOptional()
  @IsString()
  featureKey?: string;

  @IsBoolean({ message: 'enabled deve ser um booleano' })
  enabled: boolean;

  @IsOptional()
  @IsObject()
  storeLimits?: {
    dailyPickups?: number;
    maxServicesPerDay?: number;
    maxConcurrentStreams?: number;
    [key: string]: any;
  };

  @IsOptional()
  @IsObject()
  customerLimits?: {
    allowSelfService?: boolean;
    requireApproval?: boolean;
    maxDailyUsage?: number;
    maxPetsPerCustomer?: number;
    [key: string]: any;
  };

  // Manter para compatibilidade com código legado
  @IsOptional()
  @IsObject()
  limits?: {
    dailyPickups?: number;
    [key: string]: any;
  };
}


