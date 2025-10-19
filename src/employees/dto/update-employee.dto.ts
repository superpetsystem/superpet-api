import { IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { EmployeeRole } from '../entities/employee.entity';

export class UpdateEmployeeDto {
  @IsOptional()
  @IsEnum(EmployeeRole, { message: 'Role inválida' })
  role?: EmployeeRole;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  workSchedule?: {
    mon?: string[][];
    tue?: string[][];
    wed?: string[][];
    thu?: string[][];
    fri?: string[][];
    sat?: string[][];
    sun?: string[][];
  };
}
