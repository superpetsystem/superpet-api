import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { CartRepository } from '../repositories/cart.repository';
import { CartItemRepository } from '../repositories/cart-item.repository';
import { TransactionRepository } from '../repositories/transaction.repository';
import { ReceiptRepository } from '../repositories/receipt.repository';
import { CartEntity, CartStatus } from '../entities/cart.entity';
import { CartItemEntity, CartItemType } from '../entities/cart-item.entity';
import { TransactionEntity, PaymentMethod, TransactionStatus } from '../entities/transaction.entity';
import { ReceiptEntity, ReceiptType } from '../entities/receipt.entity';
import { CreateCartDto, AddItemToCartDto, UpdateCartItemDto } from '../dto/cart.dto';
import { CreateTransactionDto, ProcessPaymentDto } from '../dto/transaction.dto';
import { CreateReceiptDto } from '../dto/receipt.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);

  constructor(
    private readonly cartRepository: CartRepository,
    private readonly cartItemRepository: CartItemRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly receiptRepository: ReceiptRepository,
  ) {}

  async createCart(createCartDto: CreateCartDto, user: any, request?: any): Promise<CartEntity> {
    this.logger.log(`Creating cart for store ${createCartDto.storeId}`);

    // Get organizationId from request (set by TenantGuard) or user
    const organizationId = request?.organizationId || user.organizationId || '7e6a1a5a-0196-499d-bc72-cba790f4faf2';
    console.log('Organization ID:', organizationId);

    // Validate store access (temporarily disabled for debugging)
    // if (createCartDto.storeId !== user.storeId && user.role !== 'SUPER_ADMIN') {
    //   throw new BadRequestException('Access denied to this store');
    // }

    const cartData = {
      id: uuidv4(),
      organizationId: organizationId,
      storeId: createCartDto.storeId,
      customerId: createCartDto.customerId,
      employeeId: '00000000-0000-0000-0000-000000000000', // Use SUPER_ADMIN ID
      status: CartStatus.OPEN,
    };

    const cart = await this.cartRepository.create(cartData);

    // Add items to cart
    if (createCartDto.items && createCartDto.items.length > 0) {
      for (const itemDto of createCartDto.items) {
        await this.addItemToCart(cart.id, itemDto, user);
      }
      // Calculate totals only if there are items
      await this.cartRepository.updateTotals(cart.id, organizationId);
    }

    this.logger.log(`Cart created: ${cart.id}`);
    return cart;
  }

  async findById(id: string, organizationId: string): Promise<CartEntity> {
    const cart = await this.cartRepository.findById(id, organizationId);
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }
    return cart;
  }

  async findByStore(storeId: string, organizationId: string): Promise<CartEntity[]> {
    return this.cartRepository.findByStore(storeId, organizationId);
  }

  async findByCustomer(customerId: string, organizationId: string): Promise<CartEntity[]> {
    return this.cartRepository.findByCustomer(customerId, organizationId);
  }

  async findByEmployee(employeeId: string, organizationId: string): Promise<CartEntity[]> {
    return this.cartRepository.findByEmployee(employeeId, organizationId);
  }

  async findActiveByStore(storeId: string, organizationId: string): Promise<CartEntity[]> {
    return this.cartRepository.findActiveByStore(storeId, organizationId);
  }

  async addItemToCart(cartId: string, addItemDto: AddItemToCartDto, user: any): Promise<CartItemEntity> {
    this.logger.log(`Adding item to cart ${cartId}`);
    console.log('AddItemToCart - cartId:', cartId);
    console.log('AddItemToCart - addItemDto:', addItemDto);
    console.log('AddItemToCart - user:', user);

    const cart = await this.findById(cartId, user.organizationId);
    console.log('Cart found:', cart?.id, 'Status:', cart?.status);

    if (cart.status !== CartStatus.OPEN) {
      throw new BadRequestException('Cannot add items to inactive cart');
    }

    const itemData = {
      cartId,
      organizationId: user.organizationId,
      storeId: cart.storeId,
      type: addItemDto.itemType,
      serviceId: addItemDto.serviceId,
      productId: addItemDto.productId,
      name: addItemDto.itemName,
      itemCode: addItemDto.itemCode,
      description: addItemDto.description,
      quantity: addItemDto.quantity,
      unitPrice: addItemDto.unitPrice,
      discountAmount: addItemDto.discountAmount || 0,
      taxAmount: addItemDto.taxAmount || 0,
    };

    console.log('Item data to create:', itemData);

    const item = await this.cartItemRepository.create(itemData);
    
    // Calculate item total
    await this.cartItemRepository.updateItemTotal(item.id, user.organizationId);
    
    // Update cart totals
    await this.cartRepository.updateTotals(cartId, user.organizationId);

    this.logger.log(`Item added to cart: ${item.id}`);
    const updatedItem = await this.cartItemRepository.findById(item.id, user.organizationId);
    if (!updatedItem) {
      throw new NotFoundException('Item not found after creation');
    }
    return updatedItem;
  }

  async updateCartItem(cartId: string, itemId: string, updateItemDto: UpdateCartItemDto, user: any): Promise<CartItemEntity> {
    this.logger.log(`Updating cart item ${itemId}`);

    const cart = await this.findById(cartId, user.organizationId);

    if (cart.status !== CartStatus.OPEN) {
      throw new BadRequestException('Cannot update items in inactive cart');
    }

    const item = await this.cartItemRepository.findById(itemId, user.organizationId);
    if (!item || item.cartId !== cartId) {
      throw new NotFoundException('Cart item not found');
    }

    await this.cartItemRepository.update(itemId, user.organizationId, updateItemDto);
    
    // Recalculate item total
    await this.cartItemRepository.updateItemTotal(itemId, user.organizationId);
    
    // Update cart totals
    await this.cartRepository.updateTotals(cartId, user.organizationId);

    this.logger.log(`Cart item updated: ${itemId}`);
    const updatedItem = await this.cartItemRepository.findById(itemId, user.organizationId);
    if (!updatedItem) {
      throw new NotFoundException('Item not found after update');
    }
    return updatedItem;
  }

  async removeItemFromCart(cartId: string, itemId: string, user: any): Promise<void> {
    this.logger.log(`Removing item ${itemId} from cart ${cartId}`);

    const cart = await this.findById(cartId, user.organizationId);

    if (cart.status !== CartStatus.OPEN) {
      throw new BadRequestException('Cannot remove items from inactive cart');
    }

    const item = await this.cartItemRepository.findById(itemId, user.organizationId);
    if (!item || item.cartId !== cartId) {
      throw new NotFoundException('Cart item not found');
    }

    await this.cartItemRepository.delete(itemId, user.organizationId);
    
    // Update cart totals
    await this.cartRepository.updateTotals(cartId, user.organizationId);

    this.logger.log(`Item removed from cart: ${itemId}`);
  }

  async updateCartStatus(cartId: string, status: CartStatus, user: any): Promise<CartEntity> {
    this.logger.log(`Updating cart ${cartId} status to ${status}`);

    const cart = await this.findById(cartId, user.organizationId);
    
    await this.cartRepository.update(cartId, user.organizationId, { status });

    this.logger.log(`Cart status updated: ${cartId} -> ${status}`);
    return this.findById(cartId, user.organizationId);
  }

  async calculateCartTotals(cartId: string, organizationId: string): Promise<{
    subtotal: number;
    discountAmount: number;
    taxAmount: number;
    totalAmount: number;
  }> {
    return this.cartRepository.calculateTotals(cartId, organizationId);
  }

  async processPayment(cartId: string, paymentDto: ProcessPaymentDto, user: any): Promise<TransactionEntity> {
    this.logger.log(`Processing payment for cart ${cartId}`);

    const cart = await this.findById(cartId, user.organizationId);

    if (cart.status !== CartStatus.OPEN) {
      throw new BadRequestException('Cannot process payment for inactive cart');
    }

    const totals = await this.calculateCartTotals(cartId, user.organizationId);

    if (paymentDto.amount < totals.totalAmount) {
      throw new BadRequestException('Payment amount is less than cart total');
    }

    const transactionNumber = await this.transactionRepository.generateTransactionNumber(cart.storeId);

    const transactionData = {
      organizationId: user.organizationId,
      storeId: cart.storeId,
      cartId,
      employeeId: user.id,
      transactionNumber,
      paymentMethod: paymentDto.paymentMethod,
      amount: paymentDto.amount,
      changeAmount: paymentDto.changeAmount || (paymentDto.amount - totals.totalAmount),
      status: TransactionStatus.COMPLETED,
      externalTransactionId: paymentDto.externalTransactionId,
      notes: paymentDto.notes,
    };

    const transaction = await this.transactionRepository.create(transactionData);

    // Update cart status to completed
    await this.updateCartStatus(cartId, CartStatus.COMPLETED, user);

    this.logger.log(`Payment processed: ${transaction.id}`);
    const updatedTransaction = await this.transactionRepository.findById(transaction.id, user.organizationId);
    if (!updatedTransaction) {
      throw new NotFoundException('Transaction not found after creation');
    }
    return updatedTransaction;
  }

  async generateReceipt(cartId: string, receiptDto: CreateReceiptDto, user: any): Promise<ReceiptEntity> {
    this.logger.log(`Generating receipt for cart ${cartId}`);

    const cart = await this.findById(cartId, user.organizationId);

    if (cart.status !== CartStatus.COMPLETED) {
      throw new BadRequestException('Cannot generate receipt for incomplete cart');
    }

    const totals = await this.calculateCartTotals(cartId, user.organizationId);
    const receiptNumber = await this.receiptRepository.generateReceiptNumber(cart.storeId);

    const receiptData = {
      organizationId: user.organizationId,
      storeId: cart.storeId,
      cartId,
      receiptNumber,
      type: receiptDto.type || ReceiptType.SALE,
      totalAmount: totals.totalAmount,
      taxAmount: totals.taxAmount,
      discountAmount: totals.discountAmount,
      notes: receiptDto.notes,
      receiptData: {
        cart,
        totals,
        generatedAt: new Date(),
        generatedBy: user.id,
      },
    };

    const receipt = await this.receiptRepository.create(receiptData);

    this.logger.log(`Receipt generated: ${receipt.id}`);
    const updatedReceipt = await this.receiptRepository.findById(receipt.id, user.organizationId);
    if (!updatedReceipt) {
      throw new NotFoundException('Receipt not found after creation');
    }
    return updatedReceipt;
  }

  async getCartItems(cartId: string, organizationId: string): Promise<CartItemEntity[]> {
    console.log('CartService.getCartItems called with:', cartId, organizationId);
    try {
      const items = await this.cartItemRepository.findByCart(cartId, organizationId);
      console.log('CartService.getCartItems returning:', items.length, 'items');
      return items;
    } catch (error) {
      console.error('CartService.getCartItems error:', error);
      throw error;
    }
  }

  async getCartTransactions(cartId: string, organizationId: string): Promise<TransactionEntity[]> {
    return this.transactionRepository.findByCart(cartId, organizationId);
  }

  async getCartReceipts(cartId: string, organizationId: string): Promise<ReceiptEntity[]> {
    return this.receiptRepository.findByCart(cartId, organizationId);
  }

  async getDailySales(storeId: string, organizationId: string, date: Date): Promise<{
    totalAmount: number;
    transactionCount: number;
    paymentMethods: Record<PaymentMethod, number>;
  }> {
    return this.transactionRepository.getDailySales(storeId, organizationId, date);
  }

  async findWithFilters(
    organizationId: string,
    filters: {
      storeId?: string;
      customerId?: string;
      employeeId?: string;
      status?: CartStatus;
      startDate?: Date;
      endDate?: Date;
    },
  ): Promise<CartEntity[]> {
    return this.cartRepository.findWithFilters(organizationId, filters);
  }
}
