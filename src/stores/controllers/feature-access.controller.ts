import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RoleGuard, Roles } from '../../common/guards/role.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { EmployeeRole } from '../../employees/entities/employee.entity';
import { FeatureAccessService } from '../services/feature-access.service';
import { FeatureService } from '../services/feature.service';
import { FeatureAccessType, CustomerAccessConfig } from '../entities/feature-access.entity';
import { FeatureCategory, OrganizationPlan } from '../entities/feature.entity';

@Controller('stores/:storeId/feature-access')
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles(EmployeeRole.OWNER, EmployeeRole.ADMIN)
export class FeatureAccessController {
  private readonly logger = new Logger(FeatureAccessController.name);

  constructor(
    private readonly featureAccessService: FeatureAccessService,
    private readonly featureService: FeatureService,
  ) {}

  /**
   * Lista todas as features configuradas para uma loja
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getStoreFeatures(@Param('storeId') storeId: string) {
    this.logger.log(`📋 List store features - Store: ${storeId}`);
    
    const features = await this.featureAccessService.getStoreFeatures(storeId);
    
    this.logger.log(`✅ Found ${features.length} configured features`);
    return features;
  }

  /**
   * Lista features disponíveis para clientes
   */
  @Get('customer-available')
  @HttpCode(HttpStatus.OK)
  async getCustomerAvailableFeatures(@Param('storeId') storeId: string) {
    this.logger.log(`👤 List customer available features - Store: ${storeId}`);
    
    const features = await this.featureAccessService.getCustomerAvailableFeatures(storeId);
    
    this.logger.log(`✅ Found ${features.length} customer available features`);
    return features;
  }

  /**
   * Lista todas as features divisíveis do sistema
   */
  @Get('divisible')
  @HttpCode(HttpStatus.OK)
  async getDivisibleFeatures() {
    this.logger.log(`🔧 List divisible features`);
    
    const features = await this.featureService.findDivisibleFeatures();
    
    this.logger.log(`✅ Found ${features.length} divisible features`);
    return features;
  }

  /**
   * Configura o acesso de uma feature para uma loja
   */
  @Post(':featureKey')
  @HttpCode(HttpStatus.CREATED)
  async configureFeatureAccess(
    @Param('storeId') storeId: string,
    @Param('featureKey') featureKey: string,
    @Body() body: {
      accessType: FeatureAccessType;
      customerConfig?: CustomerAccessConfig;
    },
  ) {
    this.logger.log(`⚙️ Configure feature access - Store: ${storeId}, Feature: ${featureKey}, Type: ${body.accessType}`);
    
    const featureAccess = await this.featureAccessService.configureFeatureAccess(
      storeId,
      featureKey,
      body.accessType,
      body.customerConfig,
    );
    
    this.logger.log(`✅ Feature access configured - ID: ${featureAccess.id}`);
    return featureAccess;
  }

  /**
   * Atualiza configuração de acesso de uma feature
   */
  @Put(':featureKey')
  @HttpCode(HttpStatus.OK)
  async updateFeatureAccess(
    @Param('storeId') storeId: string,
    @Param('featureKey') featureKey: string,
    @Body() body: {
      accessType?: FeatureAccessType;
      customerConfig?: CustomerAccessConfig;
      enabled?: boolean;
    },
  ) {
    this.logger.log(`🔄 Update feature access - Store: ${storeId}, Feature: ${featureKey}`);
    
    if (body.accessType !== undefined) {
      await this.featureAccessService.configureFeatureAccess(
        storeId,
        featureKey,
        body.accessType,
        body.customerConfig,
      );
    }
    
    if (body.enabled !== undefined) {
      if (body.enabled) {
        await this.featureAccessService.enableFeature(storeId, featureKey);
      } else {
        await this.featureAccessService.disableFeature(storeId, featureKey);
      }
    }
    
    this.logger.log(`✅ Feature access updated`);
    return { message: 'Feature access updated successfully' };
  }

  /**
   * Habilita uma feature para uma loja
   */
  @Post(':featureKey/enable')
  @HttpCode(HttpStatus.OK)
  async enableFeature(
    @Param('storeId') storeId: string,
    @Param('featureKey') featureKey: string,
  ) {
    this.logger.log(`✅ Enable feature - Store: ${storeId}, Feature: ${featureKey}`);
    
    await this.featureAccessService.enableFeature(storeId, featureKey);
    
    this.logger.log(`✅ Feature enabled`);
    return { message: 'Feature enabled successfully' };
  }

  /**
   * Desabilita uma feature para uma loja
   */
  @Post(':featureKey/disable')
  @HttpCode(HttpStatus.OK)
  async disableFeature(
    @Param('storeId') storeId: string,
    @Param('featureKey') featureKey: string,
  ) {
    this.logger.log(`❌ Disable feature - Store: ${storeId}, Feature: ${featureKey}`);
    
    await this.featureAccessService.disableFeature(storeId, featureKey);
    
    this.logger.log(`✅ Feature disabled`);
    return { message: 'Feature disabled successfully' };
  }

  /**
   * Obtém configuração específica de uma feature
   */
  @Get(':featureKey')
  @HttpCode(HttpStatus.OK)
  async getFeatureConfig(
    @Param('storeId') storeId: string,
    @Param('featureKey') featureKey: string,
  ) {
    this.logger.log(`🔍 Get feature config - Store: ${storeId}, Feature: ${featureKey}`);
    
    const customerConfig = await this.featureAccessService.getCustomerAccessConfig(
      storeId,
      featureKey,
    );
    
    const isAvailableForCustomers = await this.featureAccessService.isFeatureAvailableForCustomers(
      storeId,
      featureKey,
    );
    
    this.logger.log(`✅ Feature config retrieved`);
    return {
      featureKey,
      storeId,
      isAvailableForCustomers,
      customerConfig,
    };
  }
}
