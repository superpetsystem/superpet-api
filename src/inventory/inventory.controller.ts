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
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard, Roles } from '../common/guards/role.guard';
import { StoreAccessGuard } from '../common/guards/store-access.guard';
import { FeatureGuard, RequireFeature } from '../common/guards/feature.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { EmployeeRole } from '../employees/entities/employee.entity';
import { ProductService } from './services/product.service';
import { InventoryService } from './services/inventory.service';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateMovementDto } from './dto/create-movement.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { TransferStockDto } from './dto/transfer-stock.dto';
import { ProductCategory } from './entities/product.entity';
import { MovementType } from './entities/inventory-movement.entity';

@Controller('v1')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  private readonly logger = new Logger(InventoryController.name);

  constructor(
    private readonly productService: ProductService,
    private readonly inventoryService: InventoryService,
  ) {}

  // ========== PRODUCTS ==========

  @Get('products')
  @HttpCode(HttpStatus.OK)
  async listProducts(
    @CurrentUser() user: any,
    @Query('category') category?: ProductCategory,
    @Query('active') active?: string,
    @Query('query') query?: string,
  ) {
    this.logger.log(`📋 List products - OrgID: ${user.organizationId}, Filters: ${JSON.stringify({ category, active, query })}`);

    const filters: any = {};
    if (category) filters.category = category;
    if (active !== undefined) filters.active = active === 'true';
    if (query) filters.query = query;

    const products = await this.productService.findByOrganization(user.organizationId, filters);
    
    this.logger.log(`✅ Found ${products.length} products - OrgID: ${user.organizationId}`);
    return products;
  }

  @Get('products/:id')
  @HttpCode(HttpStatus.OK)
  async getProduct(@CurrentUser() user: any, @Param('id') id: string) {
    this.logger.log(`🔍 Get product - ID: ${id}, OrgID: ${user.organizationId}`);

    const product = await this.productService.findById(id);

    if (product.organizationId !== user.organizationId) {
      this.logger.warn(`⚠️  Cross-tenant product access - ID: ${id}`);
      throw new NotFoundException('Product not found');
    }

    this.logger.log(`✅ Product found - ID: ${id}, Name: ${product.name}`);
    return product;
  }

  @Post('products')
  @HttpCode(HttpStatus.CREATED)
  @Roles(EmployeeRole.OWNER, EmployeeRole.ADMIN)
  @UseGuards(RoleGuard)
  async createProduct(@CurrentUser() user: any, @Body() dto: CreateProductDto) {
    this.logger.log(`📝 Create product - Code: ${dto.code}, Name: ${dto.name}, OrgID: ${user.organizationId}`);

    const product = await this.productService.create(user.organizationId, dto);
    
    this.logger.log(`✅ Product created - ID: ${product.id}, Code: ${dto.code}`);
    return product;
  }

  @Put('products/:id')
  @HttpCode(HttpStatus.OK)
  @Roles(EmployeeRole.OWNER, EmployeeRole.ADMIN)
  @UseGuards(RoleGuard)
  async updateProduct(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: Partial<CreateProductDto>,
  ) {
    this.logger.log(`📝 Update product - ID: ${id}, OrgID: ${user.organizationId}`);

    const product = await this.productService.findById(id);
    if (product.organizationId !== user.organizationId) {
      throw new NotFoundException('Product not found');
    }

    const updated = await this.productService.update(id, dto);
    
    this.logger.log(`✅ Product updated - ID: ${id}`);
    return updated;
  }

  @Delete('products/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(EmployeeRole.OWNER)
  @UseGuards(RoleGuard)
  async deactivateProduct(@CurrentUser() user: any, @Param('id') id: string) {
    this.logger.log(`🗑️  Deactivate product - ID: ${id}, OrgID: ${user.organizationId}`);

    const product = await this.productService.findById(id);
    if (product.organizationId !== user.organizationId) {
      throw new NotFoundException('Product not found');
    }

    await this.productService.deactivate(id);
    
    this.logger.log(`✅ Product deactivated - ID: ${id}`);
  }

  // ========== INVENTORY STOCK ==========

  @Get('stores/:storeId/stock')
  @HttpCode(HttpStatus.OK)
  @UseGuards(StoreAccessGuard)
  @RequireFeature('INVENTORY_MANAGEMENT' as any)
  @UseGuards(FeatureGuard)
  async getStoreStock(@CurrentUser() user: any, @Param('storeId') storeId: string) {
    this.logger.log(`📊 Get store stock - StoreID: ${storeId}, OrgID: ${user.organizationId}`);

    const stock = await this.inventoryService.getStoreStock(storeId);
    
    this.logger.log(`✅ Found ${stock.length} products in stock - StoreID: ${storeId}`);
    return stock;
  }

  @Get('stores/:storeId/stock/alerts')
  @HttpCode(HttpStatus.OK)
  @UseGuards(StoreAccessGuard)
  @RequireFeature('INVENTORY_MANAGEMENT' as any)
  @UseGuards(FeatureGuard)
  async getLowStockAlerts(@CurrentUser() user: any, @Param('storeId') storeId: string) {
    this.logger.log(`⚠️  Get low stock alerts - StoreID: ${storeId}, OrgID: ${user.organizationId}`);

    const alerts = await this.inventoryService.getLowStockAlerts(storeId);
    
    this.logger.log(`✅ Found ${alerts.length} low stock alerts - StoreID: ${storeId}`);
    return alerts;
  }

  @Post('stores/:storeId/stock/movements')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(StoreAccessGuard)
  @RequireFeature('INVENTORY_MANAGEMENT' as any)
  @UseGuards(FeatureGuard)
  @Roles(EmployeeRole.OWNER, EmployeeRole.ADMIN, EmployeeRole.STAFF)
  @UseGuards(RoleGuard)
  async registerMovement(
    @CurrentUser() user: any,
    @Param('storeId') storeId: string,
    @Body() dto: CreateMovementDto,
  ) {
    this.logger.log(
      `📝 Register movement - Type: ${dto.type}, Product: ${dto.productId}, StoreID: ${storeId}`,
    );

    const movement = await this.inventoryService.registerMovement(
      user.organizationId,
      storeId,
      user.employee.id,
      dto,
    );
    
    this.logger.log(`✅ Movement registered - ID: ${movement.id}, Type: ${dto.type}`);
    return movement;
  }

  @Post('stores/:storeId/stock/adjust')
  @HttpCode(HttpStatus.OK)
  @UseGuards(StoreAccessGuard)
  @RequireFeature('INVENTORY_MANAGEMENT' as any)
  @UseGuards(FeatureGuard)
  @Roles(EmployeeRole.OWNER, EmployeeRole.ADMIN)
  @UseGuards(RoleGuard)
  async adjustStock(
    @CurrentUser() user: any,
    @Param('storeId') storeId: string,
    @Body() dto: AdjustStockDto,
  ) {
    this.logger.log(`🔧 Adjust stock - Product: ${dto.productId}, NewQty: ${dto.newQuantity}, StoreID: ${storeId}`);

    const stock = await this.inventoryService.adjustStock(
      user.organizationId,
      storeId,
      user.employee.id,
      dto,
    );
    
    this.logger.log(`✅ Stock adjusted - ProductID: ${dto.productId}, NewQty: ${dto.newQuantity}`);
    return stock;
  }

  @Get('stores/:storeId/stock/movements')
  @HttpCode(HttpStatus.OK)
  @UseGuards(StoreAccessGuard)
  @RequireFeature('INVENTORY_MANAGEMENT' as any)
  @UseGuards(FeatureGuard)
  async getMovements(
    @CurrentUser() user: any,
    @Param('storeId') storeId: string,
    @Query('productId') productId?: string,
    @Query('type') type?: MovementType,
  ) {
    this.logger.log(`📋 Get movements - StoreID: ${storeId}, Filters: ${JSON.stringify({ productId, type })}`);

    const filters: any = {};
    if (productId) filters.productId = productId;
    if (type) filters.type = type;

    const movements = await this.inventoryService.getMovements(storeId, filters);
    
      this.logger.log(`✅ Found ${movements.length} movements - StoreID: ${storeId}`);
        return movements;
      }
    
      @Post('transfers')
      @HttpCode(HttpStatus.CREATED)
      @Roles(EmployeeRole.OWNER, EmployeeRole.ADMIN)
      @UseGuards(RoleGuard)
      async transferStock(@CurrentUser() user: any, @Body() dto: TransferStockDto) {
        this.logger.log(
          `🔄 Transfer stock - Product: ${dto.productId}, From: ${dto.fromStoreId}, To: ${dto.toStoreId}, Qty: ${dto.quantity}`,
        );
    
        const result = await this.inventoryService.transferStock(
          user.organizationId,
          user.employee.id,
          dto.fromStoreId,
          dto.toStoreId,
          dto.productId,
          dto.quantity,
          dto.notes,
        );
    
        this.logger.log(`✅ Stock transferred - ${dto.quantity} units`);
        return result;
      }
    
      @Get('stores/:storeId/expiring')
      @HttpCode(HttpStatus.OK)
      @UseGuards(StoreAccessGuard)
      async getExpiringProducts(
        @CurrentUser() user: any,
        @Param('storeId') storeId: string,
        @Query('daysAhead') daysAhead?: number,
      ) {
        this.logger.log(`⚠️  Get expiring products - StoreID: ${storeId}, Days: ${daysAhead || 30}`);
    
        const products = await this.inventoryService.getExpiringProducts(storeId, daysAhead ? +daysAhead : 30);
    
        this.logger.log(`✅ Found ${products.length} expiring products`);
        return products;
      }
    }

