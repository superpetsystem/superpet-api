import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards, Logger, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { RoleGuard, Roles } from '../common/guards/role.guard';
import { StoreAccessGuard } from '../common/guards/store-access.guard';
import { RequireFeature } from '../common/guards/feature.guard';
import { PdvFeatureGuard } from './guards/pdv-feature.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CartService } from './services/cart.service';
import { CreateCartDto, AddItemToCartDto, UpdateCartItemDto } from './dto/cart.dto';
import { ProcessPaymentDto } from './dto/transaction.dto';
import { CreateReceiptDto } from './dto/receipt.dto';
import { CartStatus } from './entities/cart.entity';
import { PaymentMethod } from './entities/transaction.entity';
import { EmployeeRole } from '../employees/entities/employee.entity';
import { FeatureKey } from '../stores/entities/store-feature.entity';

@Controller('pdv')
@UseGuards(JwtAuthGuard, TenantGuard)
export class PdvController {
  private readonly logger = new Logger(PdvController.name);

  constructor(private readonly cartService: CartService) {}

  // Cart Management
  @Post('carts')
  @RequireFeature(FeatureKey.PDV_POINT_OF_SALE)
  @Roles(EmployeeRole.OWNER, EmployeeRole.ADMIN, EmployeeRole.STAFF)
  @UseGuards(RoleGuard, PdvFeatureGuard)
  async createCart(@Body() createCartDto: CreateCartDto, @CurrentUser() user: any, @Req() request: any) {
    this.logger.log(`Creating cart for store ${createCartDto.storeId}`);
    const cart = await this.cartService.createCart(createCartDto, user, request);
    this.logger.log(`Cart created: ${cart.id}`);
    return cart;
  }

  @Get('carts/:id')
  @Roles(EmployeeRole.OWNER, EmployeeRole.ADMIN, EmployeeRole.STAFF, EmployeeRole.VIEWER)
  @UseGuards(RoleGuard)
  async getCart(@Param('id') id: string, @CurrentUser() user: any) {
    this.logger.log(`Getting cart ${id}`);
    const cart = await this.cartService.findById(id, user.organizationId);
    this.logger.log(`Cart found: ${cart.id}`);
    return cart;
  }

  @Get('stores/:storeId/carts')
  @Roles(EmployeeRole.OWNER, EmployeeRole.ADMIN, EmployeeRole.STAFF, EmployeeRole.VIEWER)
  @UseGuards(RoleGuard, StoreAccessGuard)
  async getCartsByStore(@Param('storeId') storeId: string, @CurrentUser() user: any) {
    this.logger.log(`Getting carts for store ${storeId}`);
    const carts = await this.cartService.findByStore(storeId, user.organizationId);
    this.logger.log(`Found ${carts.length} carts`);
    return carts;
  }

  @Get('customers/:customerId/carts')
  @Roles(EmployeeRole.OWNER, EmployeeRole.ADMIN, EmployeeRole.STAFF, EmployeeRole.VIEWER)
  @UseGuards(RoleGuard)
  async getCartsByCustomer(@Param('customerId') customerId: string, @CurrentUser() user: any) {
    this.logger.log(`Getting carts for customer ${customerId}`);
    const carts = await this.cartService.findByCustomer(customerId, user.organizationId);
    this.logger.log(`Found ${carts.length} carts`);
    return carts;
  }

  @Get('employees/:employeeId/carts')
  @Roles(EmployeeRole.OWNER, EmployeeRole.ADMIN, EmployeeRole.STAFF, EmployeeRole.VIEWER)
  @UseGuards(RoleGuard)
  async getCartsByEmployee(@Param('employeeId') employeeId: string, @CurrentUser() user: any) {
    this.logger.log(`Getting carts for employee ${employeeId}`);
    const carts = await this.cartService.findByEmployee(employeeId, user.organizationId);
    this.logger.log(`Found ${carts.length} carts`);
    return carts;
  }

  @Get('stores/:storeId/carts/active')
  @Roles(EmployeeRole.OWNER, EmployeeRole.ADMIN, EmployeeRole.STAFF, EmployeeRole.VIEWER)
  @UseGuards(RoleGuard, StoreAccessGuard)
  async getActiveCartsByStore(@Param('storeId') storeId: string, @CurrentUser() user: any) {
    this.logger.log(`Getting active carts for store ${storeId}`);
    const carts = await this.cartService.findActiveByStore(storeId, user.organizationId);
    this.logger.log(`Found ${carts.length} active carts`);
    return carts;
  }

  @Patch('carts/:id/status')
  @Roles(EmployeeRole.OWNER, EmployeeRole.ADMIN, EmployeeRole.STAFF)
  @UseGuards(RoleGuard)
  async updateCartStatus(
    @Param('id') id: string,
    @Body('status') status: CartStatus,
    @CurrentUser() user: any,
  ) {
    this.logger.log(`Updating cart ${id} status to ${status}`);
    const cart = await this.cartService.updateCartStatus(id, status, user);
    this.logger.log(`Cart status updated: ${cart.id}`);
    return cart;
  }

  // Cart Items Management
  @Post('carts/:cartId/items')
  @RequireFeature(FeatureKey.PDV_POINT_OF_SALE)
  @Roles(EmployeeRole.OWNER, EmployeeRole.ADMIN, EmployeeRole.STAFF)
  @UseGuards(RoleGuard)
  async addItemToCart(
    @Param('cartId') cartId: string,
    @Body() addItemDto: AddItemToCartDto,
    @CurrentUser() user: any,
  ) {
    this.logger.log(`Adding item to cart ${cartId}`);
    const item = await this.cartService.addItemToCart(cartId, addItemDto, user);
    this.logger.log(`Item added: ${item.id}`);
    return item;
  }

  @Put('carts/:cartId/items/:itemId')
  @Roles(EmployeeRole.OWNER, EmployeeRole.ADMIN, EmployeeRole.STAFF)
  @UseGuards(RoleGuard)
  async updateCartItem(
    @Param('cartId') cartId: string,
    @Param('itemId') itemId: string,
    @Body() updateItemDto: UpdateCartItemDto,
    @CurrentUser() user: any,
  ) {
    this.logger.log(`Updating cart item ${itemId}`);
    const item = await this.cartService.updateCartItem(cartId, itemId, updateItemDto, user);
    this.logger.log(`Cart item updated: ${item.id}`);
    return item;
  }

  @Delete('carts/:cartId/items/:itemId')
  @Roles(EmployeeRole.OWNER, EmployeeRole.ADMIN, EmployeeRole.STAFF)
  @UseGuards(RoleGuard)
  async removeItemFromCart(
    @Param('cartId') cartId: string,
    @Param('itemId') itemId: string,
    @CurrentUser() user: any,
  ) {
    this.logger.log(`Removing item ${itemId} from cart ${cartId}`);
    await this.cartService.removeItemFromCart(cartId, itemId, user);
    this.logger.log(`Item removed from cart`);
    return { message: 'Item removed from cart successfully' };
  }

  @Get('carts/:cartId/items')
  @Roles(EmployeeRole.OWNER, EmployeeRole.ADMIN, EmployeeRole.STAFF, EmployeeRole.VIEWER)
  @UseGuards(RoleGuard)
  async getCartItems(@Param('cartId') cartId: string, @CurrentUser() user: any, @Req() request: any) {
    this.logger.log(`Getting items for cart ${cartId}`);
    const organizationId = request?.organizationId || user.organizationId;
    const items = await this.cartService.getCartItems(cartId, organizationId);
    this.logger.log(`Found ${items.length} items`);
    return items;
  }

  // Payment Processing
  @Post('carts/:cartId/payment')
  @Roles(EmployeeRole.OWNER, EmployeeRole.ADMIN, EmployeeRole.STAFF)
  @UseGuards(RoleGuard)
  async processPayment(
    @Param('cartId') cartId: string,
    @Body() paymentDto: ProcessPaymentDto,
    @CurrentUser() user: any,
  ) {
    this.logger.log(`Processing payment for cart ${cartId}`);
    const transaction = await this.cartService.processPayment(cartId, paymentDto, user);
    this.logger.log(`Payment processed: ${transaction.id}`);
    return transaction;
  }

  @Get('carts/:cartId/transactions')
  @Roles(EmployeeRole.OWNER, EmployeeRole.ADMIN, EmployeeRole.STAFF, EmployeeRole.VIEWER)
  @UseGuards(RoleGuard)
  async getCartTransactions(@Param('cartId') cartId: string, @CurrentUser() user: any) {
    this.logger.log(`Getting transactions for cart ${cartId}`);
    const transactions = await this.cartService.getCartTransactions(cartId, user.organizationId);
    this.logger.log(`Found ${transactions.length} transactions`);
    return transactions;
  }

  // Receipt Generation
  @Post('carts/:cartId/receipt')
  @Roles(EmployeeRole.OWNER, EmployeeRole.ADMIN, EmployeeRole.STAFF)
  @UseGuards(RoleGuard)
  async generateReceipt(
    @Param('cartId') cartId: string,
    @Body() receiptDto: CreateReceiptDto,
    @CurrentUser() user: any,
  ) {
    this.logger.log(`Generating receipt for cart ${cartId}`);
    const receipt = await this.cartService.generateReceipt(cartId, receiptDto, user);
    this.logger.log(`Receipt generated: ${receipt.id}`);
    return receipt;
  }

  @Get('carts/:cartId/receipts')
  @Roles(EmployeeRole.OWNER, EmployeeRole.ADMIN, EmployeeRole.STAFF, EmployeeRole.VIEWER)
  @UseGuards(RoleGuard)
  async getCartReceipts(@Param('cartId') cartId: string, @CurrentUser() user: any) {
    this.logger.log(`Getting receipts for cart ${cartId}`);
    const receipts = await this.cartService.getCartReceipts(cartId, user.organizationId);
    this.logger.log(`Found ${receipts.length} receipts`);
    return receipts;
  }

  // Cart Totals
  @Get('carts/:cartId/totals')
  @Roles(EmployeeRole.OWNER, EmployeeRole.ADMIN, EmployeeRole.STAFF, EmployeeRole.VIEWER)
  @UseGuards(RoleGuard)
  async getCartTotals(@Param('cartId') cartId: string, @CurrentUser() user: any) {
    this.logger.log(`Getting totals for cart ${cartId}`);
    const totals = await this.cartService.calculateCartTotals(cartId, user.organizationId);
    this.logger.log(`Cart totals calculated`);
    return totals;
  }

  // Reports and Analytics
  @Get('stores/:storeId/sales/daily')
  @Roles(EmployeeRole.OWNER, EmployeeRole.ADMIN, EmployeeRole.STAFF, EmployeeRole.VIEWER)
  @UseGuards(RoleGuard, StoreAccessGuard)
  async getDailySales(
    @Param('storeId') storeId: string,
    @Query('date') date: string,
    @CurrentUser() user: any,
  ) {
    this.logger.log(`Getting daily sales for store ${storeId} on ${date}`);
    const salesDate = date ? new Date(date) : new Date();
    const sales = await this.cartService.getDailySales(storeId, user.organizationId, salesDate);
    this.logger.log(`Daily sales retrieved`);
    return sales;
  }

  // Advanced Search
  @Get('carts')
  @Roles(EmployeeRole.OWNER, EmployeeRole.ADMIN, EmployeeRole.STAFF, EmployeeRole.VIEWER)
  @UseGuards(RoleGuard)
  async findCarts(
    @CurrentUser() user: any,
    @Req() request: any,
    @Query('storeId') storeId?: string,
    @Query('customerId') customerId?: string,
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: CartStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    this.logger.log(`Searching carts with filters`);
    const organizationId = request?.organizationId || user.organizationId;
    const filters = {
      storeId,
      customerId,
      employeeId,
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };

    const carts = await this.cartService.findWithFilters(organizationId, filters);
    this.logger.log(`Found ${carts.length} carts`);
    return carts;
  }
}
