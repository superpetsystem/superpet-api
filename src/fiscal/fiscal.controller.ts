import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard, Roles } from '../common/guards/role.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { StoreAccessGuard } from '../common/guards/store-access.guard';
import { EmployeeRole } from '../employees/entities/employee.entity';
import { FiscalService } from './services/fiscal.service';
import { InvoiceRepository } from './repositories/invoice.repository';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FeatureGuard, RequireFeature } from '../common/guards/feature.guard';
import { FeatureKey, FeatureAccessType } from '../stores/entities/store-feature.entity';

@Controller('fiscal')
@UseGuards(JwtAuthGuard, TenantGuard)
export class FiscalController {
  private readonly logger = new Logger(FiscalController.name);

  constructor(
    private readonly fiscalService: FiscalService,
    private readonly invoiceRepository: InvoiceRepository,
  ) {}

  @Post('stores/:storeId/invoices')
  @Roles(EmployeeRole.OWNER, EmployeeRole.ADMIN, EmployeeRole.STAFF)
  @RequireFeature(FeatureKey.FISCAL_INVOICING, FeatureAccessType.STORE)
  @UseGuards(RoleGuard, StoreAccessGuard, FeatureGuard)
  @HttpCode(HttpStatus.CREATED)
  async createInvoice(
    @Param('storeId') storeId: string,
    @Body() dto: CreateInvoiceDto,
    @CurrentUser() user: any,
  ) {
    this.logger.log(`Creating invoice for store ${storeId}`);
    return this.fiscalService.createInvoice(storeId, dto);
  }

  @Get('stores/:storeId/invoices')
  @RequireFeature(FeatureKey.FISCAL_INVOICING, FeatureAccessType.STORE)
  @UseGuards(StoreAccessGuard, FeatureGuard)
  @HttpCode(HttpStatus.OK)
  async getStoreInvoices(
    @Param('storeId') storeId: string,
    @CurrentUser() user: any,
  ) {
    this.logger.log(`Getting invoices for store ${storeId}`);
    return this.fiscalService.findByStore(storeId);
  }

  @Get('invoices/:id')
  @HttpCode(HttpStatus.OK)
  async getInvoice(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    const invoice = await this.fiscalService.findById(id);
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }
    return invoice;
  }

  @Get('customers/:customerId/invoices')
  @HttpCode(HttpStatus.OK)
  async getCustomerInvoices(
    @Param('customerId') customerId: string,
    @CurrentUser() user: any,
  ) {
    this.logger.log(`Getting invoices for customer ${customerId}`);
    return this.fiscalService.findByCustomer(customerId);
  }

  @Put('invoices/:id/cancel')
  @Roles(EmployeeRole.OWNER, EmployeeRole.ADMIN)
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  async cancelInvoice(
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    this.logger.log(`Canceling invoice ${id}`);
    return this.fiscalService.cancelInvoice(id, reason);
  }

  @Get('invoices/:id/xml')
  @HttpCode(HttpStatus.OK)
  async getXML(@Param('id') id: string) {
    const invoice = await this.fiscalService.findById(id);
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }
    
    // Return XML content
    return {
      xml: invoice.xmlContent,
      url: invoice.xmlUrl,
    };
  }

  @Get('invoices/:id/danfe')
  @HttpCode(HttpStatus.OK)
  async getDANFE(@Param('id') id: string) {
    const invoice = await this.fiscalService.findById(id);
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }
    
    // Return DANFE URL
    return {
      danfeUrl: invoice.danfeUrl,
    };
  }
}


