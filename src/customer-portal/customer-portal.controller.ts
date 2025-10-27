import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CustomerAccessGuard, RequireCustomerAccess } from '../stores/guards/customer-access.guard';
import { FeatureAccessService } from '../stores/services/feature-access.service';

@Controller('customer-portal')
@UseGuards(JwtAuthGuard)
export class CustomerPortalController {
  private readonly logger = new Logger(CustomerPortalController.name);

  constructor(
    private readonly featureAccessService: FeatureAccessService,
  ) {}

  /**
   * Lista pets do cliente (se a feature estiver habilitada para clientes)
   */
  @Get('stores/:storeId/pets')
  @UseGuards(CustomerAccessGuard)
  @RequireCustomerAccess('PET_REGISTRATION')
  @HttpCode(HttpStatus.OK)
  async getMyPets(
    @Param('storeId') storeId: string,
    @Query('customerId') customerId: string,
  ) {
    this.logger.log(`🐾 Get customer pets - Store: ${storeId}, Customer: ${customerId}`);
    
    // Verificar configuração específica da feature
    const customerConfig = await this.featureAccessService.getCustomerAccessConfig(
      storeId,
      'PET_REGISTRATION',
    );
    
    // Implementar lógica de busca de pets do cliente
    // ...
    
    this.logger.log(`✅ Customer pets retrieved`);
    return { message: 'Customer pets retrieved successfully' };
  }

  /**
   * Agenda um serviço (se a feature estiver habilitada para clientes)
   */
  @Post('stores/:storeId/bookings')
  @UseGuards(CustomerAccessGuard)
  @RequireCustomerAccess('ONLINE_BOOKING')
  @HttpCode(HttpStatus.CREATED)
  async createBooking(
    @Param('storeId') storeId: string,
    @Body() bookingData: any,
  ) {
    this.logger.log(`📅 Create customer booking - Store: ${storeId}`);
    
    // Verificar configuração específica da feature
    const customerConfig = await this.featureAccessService.getCustomerAccessConfig(
      storeId,
      'ONLINE_BOOKING',
    );
    
    // Verificar se requer aprovação
    if (customerConfig?.requireApproval) {
      // Criar agendamento pendente de aprovação
      this.logger.log(`⏳ Booking created pending approval`);
    } else {
      // Criar agendamento confirmado
      this.logger.log(`✅ Booking created and confirmed`);
    }
    
    return { message: 'Booking created successfully' };
  }

  /**
   * Lista produtos disponíveis (se a feature estiver habilitada para clientes)
   */
  @Get('stores/:storeId/products')
  @UseGuards(CustomerAccessGuard)
  @RequireCustomerAccess('PRODUCT_CATALOG')
  @HttpCode(HttpStatus.OK)
  async getProducts(
    @Param('storeId') storeId: string,
    @Query('category') category?: string,
  ) {
    this.logger.log(`🛍️ Get customer products - Store: ${storeId}, Category: ${category}`);
    
    // Verificar configuração específica da feature
    const customerConfig = await this.featureAccessService.getCustomerAccessConfig(
      storeId,
      'PRODUCT_CATALOG',
    );
    
    // Implementar lógica de busca de produtos
    // ...
    
    this.logger.log(`✅ Customer products retrieved`);
    return { message: 'Customer products retrieved successfully' };
  }

  /**
   * Visualiza live cam do pet (se a feature estiver habilitada para clientes)
   */
  @Get('stores/:storeId/pets/:petId/live-cam')
  @UseGuards(CustomerAccessGuard)
  @RequireCustomerAccess('LIVE_CAM')
  @HttpCode(HttpStatus.OK)
  async getPetLiveCam(
    @Param('storeId') storeId: string,
    @Param('petId') petId: string,
  ) {
    this.logger.log(`📹 Get pet live cam - Store: ${storeId}, Pet: ${petId}`);
    
    // Verificar configuração específica da feature
    const customerConfig = await this.featureAccessService.getCustomerAccessConfig(
      storeId,
      'LIVE_CAM',
    );
    
    // Implementar lógica de live cam
    // ...
    
    this.logger.log(`✅ Pet live cam retrieved`);
    return { message: 'Pet live cam retrieved successfully' };
  }

  /**
   * Solicita tele-busca (se a feature estiver habilitada para clientes)
   */
  @Post('stores/:storeId/pickups')
  @UseGuards(CustomerAccessGuard)
  @RequireCustomerAccess('TELEPICKUP')
  @HttpCode(HttpStatus.CREATED)
  async requestPickup(
    @Param('storeId') storeId: string,
    @Body() pickupData: any,
  ) {
    this.logger.log(`🚗 Request pickup - Store: ${storeId}`);
    
    // Verificar configuração específica da feature
    const customerConfig = await this.featureAccessService.getCustomerAccessConfig(
      storeId,
      'TELEPICKUP',
    );
    
    // Verificar limite diário
    if (customerConfig?.maxDailyUsage) {
      // Verificar se cliente já atingiu o limite
      // ...
    }
    
    this.logger.log(`✅ Pickup requested`);
    return { message: 'Pickup requested successfully' };
  }

  /**
   * Lista features disponíveis para o cliente nesta loja
   */
  @Get('stores/:storeId/available-features')
  @HttpCode(HttpStatus.OK)
  async getAvailableFeatures(@Param('storeId') storeId: string) {
    this.logger.log(`📋 Get available features - Store: ${storeId}`);
    
    const features = await this.featureAccessService.getCustomerAvailableFeatures(storeId);
    
    this.logger.log(`✅ Found ${features.length} available features`);
    return features.map(feature => ({
      key: feature.featureKey,
      name: feature.feature?.name,
      description: feature.feature?.description,
      customerConfig: feature.customerAccessConfig,
    }));
  }
}
