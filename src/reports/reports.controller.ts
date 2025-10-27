import {
  Controller,
  Get,
  Query,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard, Roles } from '../common/guards/role.guard';
import { StoreAccessGuard } from '../common/guards/store-access.guard';
import { RequireFeature, FeatureGuard } from '../common/guards/feature.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { EmployeeRole } from '../employees/entities/employee.entity';
import { ReportsService } from './services/reports.service';
import { ReportFiltersDto } from './dto/report-filters.dto';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  private readonly logger = new Logger(ReportsController.name);

  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  @HttpCode(HttpStatus.OK)
  @Roles(EmployeeRole.OWNER, EmployeeRole.ADMIN)
  @UseGuards(RoleGuard)
  @RequireFeature('REPORTS_DASHBOARD' as any)
  @UseGuards(FeatureGuard)
  async getDashboard(
    @CurrentUser() user: any,
    @Query('storeId') storeId?: string,
  ) {
    this.logger.log(`📊 Dashboard request - OrgID: ${user.organizationId}, StoreID: ${storeId || 'all'}`);

    const dashboard = await this.reportsService.getDashboardOverview(user.organizationId, storeId);
    
    this.logger.log(`✅ Dashboard generated - OrgID: ${user.organizationId}`);
    return dashboard;
  }

  @Get('customers')
  @HttpCode(HttpStatus.OK)
  @Roles(EmployeeRole.OWNER, EmployeeRole.ADMIN)
  @UseGuards(RoleGuard)
  @RequireFeature('REPORTS_DASHBOARD' as any)
  @UseGuards(FeatureGuard)
  async getCustomerReport(
    @CurrentUser() user: any,
    @Query() filters: ReportFiltersDto,
  ) {
    this.logger.log(`📊 Customer report - OrgID: ${user.organizationId}, Period: ${filters.period}`);

    const report = await this.reportsService.getCustomerReport(user.organizationId, filters);
    
    this.logger.log(`✅ Customer report generated - New: ${report.newCustomers}`);
    return report;
  }

  @Get('pets')
  @HttpCode(HttpStatus.OK)
  @Roles(EmployeeRole.OWNER, EmployeeRole.ADMIN)
  @UseGuards(RoleGuard)
  @RequireFeature('REPORTS_DASHBOARD' as any)
  @UseGuards(FeatureGuard)
  async getPetReport(
    @CurrentUser() user: any,
    @Query() filters: ReportFiltersDto,
  ) {
    this.logger.log(`📊 Pet report - OrgID: ${user.organizationId}, Period: ${filters.period}`);

    const report = await this.reportsService.getPetReport(user.organizationId, filters);
    
    this.logger.log(`✅ Pet report generated - New: ${report.newPets}`);
    return report;
  }

  @Get('stores/:storeId/performance')
  @HttpCode(HttpStatus.OK)
  @UseGuards(StoreAccessGuard)
  @Roles(EmployeeRole.OWNER, EmployeeRole.ADMIN)
  @UseGuards(RoleGuard)
  @RequireFeature('REPORTS_DASHBOARD' as any)
  @UseGuards(FeatureGuard)
  async getStorePerformance(
    @CurrentUser() user: any,
    @Param('storeId') storeId: string,
    @Query() filters: ReportFiltersDto,
  ) {
    this.logger.log(`📊 Store performance report - StoreID: ${storeId}, Period: ${filters.period}`);

    const report = await this.reportsService.getStorePerformance(storeId, filters);
    
    this.logger.log(`✅ Store performance generated - StoreID: ${storeId}`);
    return report;
  }
}

