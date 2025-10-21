import { IsOptional, IsDateString, IsEnum } from 'class-validator';

export enum ReportType {
  SALES = 'SALES',
  SERVICES = 'SERVICES',
  CUSTOMERS = 'CUSTOMERS',
  INVENTORY = 'INVENTORY',
  FINANCIAL = 'FINANCIAL',
}

export enum ReportPeriod {
  TODAY = 'TODAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  YEAR = 'YEAR',
  CUSTOM = 'CUSTOM',
}

export class ReportFiltersDto {
  @IsEnum(ReportPeriod)
  @IsOptional()
  period?: ReportPeriod;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}

