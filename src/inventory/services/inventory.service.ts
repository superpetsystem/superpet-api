import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InventoryStockRepository } from '../repositories/inventory-stock.repository';
import { InventoryMovementRepository } from '../repositories/inventory-movement.repository';
import { ProductService } from './product.service';
import { CreateMovementDto } from '../dto/create-movement.dto';
import { AdjustStockDto } from '../dto/adjust-stock.dto';
import { InventoryMovementEntity, MovementType } from '../entities/inventory-movement.entity';
import { InventoryStockEntity } from '../entities/inventory-stock.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    private readonly stockRepository: InventoryStockRepository,
    private readonly movementRepository: InventoryMovementRepository,
    private readonly productService: ProductService,
  ) {}

  /**
   * Registrar movimentação de estoque
   */
  async registerMovement(
    organizationId: string,
    storeId: string,
    employeeId: string,
    dto: CreateMovementDto,
  ): Promise<InventoryMovementEntity> {
    this.logger.log(
      `🔍 [INVENTORY] Registering movement - Type: ${dto.type}, Product: ${dto.productId}, Qty: ${dto.quantity}, StoreID: ${storeId}`,
    );

    // Validar produto existe
    const product = await this.productService.findById(dto.productId);
    if (product.organizationId !== organizationId) {
      throw new BadRequestException('Product not found in organization');
    }

    // Buscar estoque atual
    let stock = await this.stockRepository.findByStoreAndProduct(storeId, dto.productId);

    // Calcular nova quantidade
    let newQuantity = stock?.quantity || 0;

    if (dto.type === MovementType.ENTRY || dto.type === MovementType.RETURN) {
      newQuantity += dto.quantity;
    } else if (dto.type === MovementType.EXIT || dto.type === MovementType.LOSS) {
      newQuantity -= dto.quantity;
      if (newQuantity < 0) {
        this.logger.error(
          `❌ [INVENTORY] INSUFFICIENT_STOCK - Product: ${product.name}, Current: ${stock?.quantity || 0}, Requested: ${dto.quantity}`,
        );
        throw new BadRequestException('INSUFFICIENT_STOCK: Not enough stock for this operation');
      }
    } else if (dto.type === MovementType.ADJUSTMENT) {
      // Para ajuste, quantity já é o valor absoluto
      newQuantity = dto.quantity;
    }

    // Criar movimento
    const movement = await this.movementRepository.create({
      id: uuidv4(),
      organizationId,
      storeId,
      productId: dto.productId,
      type: dto.type,
      quantity: dto.quantity,
      reason: dto.reason || null,
      referenceType: dto.referenceType || null,
      referenceId: dto.referenceId || null,
      employeeId,
      costPriceCents: dto.costPriceCents || null,
      notes: dto.notes || null,
    });

    // Atualizar estoque
    if (!stock) {
      // Criar estoque inicial
      await this.stockRepository.upsert({
        id: uuidv4(),
        organizationId,
        storeId,
        productId: dto.productId,
        quantity: newQuantity,
        reserved: 0,
        available: newQuantity,
        lastCountAt: new Date(),
      });
    } else {
      // Atualizar estoque
      await this.stockRepository.updateQuantities(storeId, dto.productId, newQuantity, stock.reserved);
    }

    this.logger.log(
      `✅ [INVENTORY] Movement registered - Type: ${dto.type}, NewQty: ${newQuantity}, MovementID: ${movement.id}`,
    );

    return movement;
  }

  /**
   * Ajustar estoque manualmente (inventário físico)
   */
  async adjustStock(
    organizationId: string,
    storeId: string,
    employeeId: string,
    dto: AdjustStockDto,
  ): Promise<InventoryStockEntity> {
    this.logger.log(
      `🔍 [INVENTORY] Adjusting stock - Product: ${dto.productId}, NewQty: ${dto.newQuantity}, StoreID: ${storeId}`,
    );

    // Validar produto
    const product = await this.productService.findById(dto.productId);

    const stock = await this.stockRepository.findByStoreAndProduct(storeId, dto.productId);
    const oldQuantity = stock?.quantity || 0;
    const difference = dto.newQuantity - oldQuantity;

    // Registrar movimentação de ajuste
    await this.movementRepository.create({
      id: uuidv4(),
      organizationId,
      storeId,
      productId: dto.productId,
      type: MovementType.ADJUSTMENT,
      quantity: Math.abs(difference),
      reason: dto.reason || 'Manual adjustment',
      employeeId,
      notes: `Adjusted from ${oldQuantity} to ${dto.newQuantity}`,
    });

    // Atualizar estoque
    const updated = await this.stockRepository.upsert({
      id: stock?.id || uuidv4(),
      organizationId,
      storeId,
      productId: dto.productId,
      quantity: dto.newQuantity,
      reserved: stock?.reserved || 0,
      available: dto.newQuantity - (stock?.reserved || 0),
      lastCountAt: new Date(),
    });

    this.logger.log(`✅ [INVENTORY] Stock adjusted - OldQty: ${oldQuantity}, NewQty: ${dto.newQuantity}, Diff: ${difference}`);

    return updated;
  }

  /**
   * Listar produtos com estoque baixo
   */
  async getLowStockAlerts(storeId: string): Promise<InventoryStockEntity[]> {
    this.logger.log(`🔍 [INVENTORY] Checking low stock alerts - StoreID: ${storeId}`);
    
    const lowStock = await this.stockRepository.findLowStock(storeId);
    
    this.logger.log(`✅ [INVENTORY] Found ${lowStock.length} products with low stock`);
    
    return lowStock;
  }

  /**
   * Ver estoque de uma loja
   */
  async getStoreStock(storeId: string): Promise<InventoryStockEntity[]> {
    return this.stockRepository.findByStore(storeId);
  }

  /**
   * Ver histórico de movimentações
   */
  async getMovements(storeId: string, filters?: any): Promise<InventoryMovementEntity[]> {
    return this.movementRepository.findByStore(storeId, filters);
  }

  /**
   * Transferir estoque entre lojas
   */
  async transferStock(
    organizationId: string,
    employeeId: string,
    fromStoreId: string,
    toStoreId: string,
    productId: string,
    quantity: number,
    notes?: string,
  ): Promise<{ from: InventoryMovementEntity; to: InventoryMovementEntity }> {
    this.logger.log(
      `🔄 [BUSINESS RULE] Stock transfer - Product: ${productId}, From: ${fromStoreId}, To: ${toStoreId}, Qty: ${quantity}`,
    );

    if (fromStoreId === toStoreId) {
      this.logger.error(`❌ [BUSINESS RULE] INVALID_TRANSFER - Same store transfer not allowed`);
      throw new BadRequestException('INVALID_TRANSFER: Cannot transfer to the same store');
    }

    const product = await this.productService.findById(productId);
    if (!product || product.organizationId !== organizationId) {
      throw new NotFoundException('PRODUCT_NOT_FOUND');
    }

    const fromStock = await this.stockRepository.findByStoreAndProduct(fromStoreId, productId);
    if (!fromStock || fromStock.available < quantity) {
      this.logger.error(
        `❌ [BUSINESS RULE] INSUFFICIENT_STOCK - Store: ${fromStoreId}, Available: ${fromStock?.available || 0}, Requested: ${quantity}`,
      );
      throw new BadRequestException('INSUFFICIENT_STOCK: Not enough stock in source store');
    }

    // Registrar saída na loja origem
    const exitData = {
      id: uuidv4(),
      organizationId,
      storeId: fromStoreId,
      productId,
      type: MovementType.TRANSFER,
      quantity: -quantity,
      reason: `Transferência para loja ${toStoreId}`,
      referenceType: 'TRANSFER',
      referenceId: toStoreId,
      employeeId,
      notes,
    };
    const exitMovement = await this.movementRepository.create(exitData);

    // Atualizar estoque origem
    await this.stockRepository.upsert({
      id: fromStock.id,
      organizationId,
      storeId: fromStoreId,
      productId,
      quantity: fromStock.quantity - quantity,
      reserved: fromStock.reserved,
      available: (fromStock.quantity - quantity) - fromStock.reserved,
      lastCountAt: new Date(),
    });

    // Registrar entrada na loja destino
    let toStock = await this.stockRepository.findByStoreAndProduct(toStoreId, productId);
    if (!toStock) {
      await this.stockRepository.upsert({
        id: uuidv4(),
        organizationId,
        storeId: toStoreId,
        productId,
        quantity: quantity,
        reserved: 0,
        available: quantity,
      });
      toStock = await this.stockRepository.findByStoreAndProduct(toStoreId, productId);
    } else {
      await this.stockRepository.upsert({
        id: toStock.id,
        organizationId,
        storeId: toStoreId,
        productId,
        quantity: toStock.quantity + quantity,
        reserved: toStock.reserved,
        available: (toStock.quantity + quantity) - toStock.reserved,
        lastCountAt: new Date(),
      });
    }

    const entryData = {
      id: uuidv4(),
      organizationId,
      storeId: toStoreId,
      productId,
      type: MovementType.TRANSFER,
      quantity: quantity,
      reason: `Transferência da loja ${fromStoreId}`,
      referenceType: 'TRANSFER',
      referenceId: fromStoreId,
      employeeId,
      notes,
    };
    const entryMovement = await this.movementRepository.create(entryData);

    this.logger.log(`✅ [BUSINESS RULE] Stock transferred successfully - ${quantity} units`);

    return { from: exitMovement, to: entryMovement };
  }

  /**
   * Alertas de produtos próximos ao vencimento
   */
  async getExpiringProducts(storeId: string, daysAhead: number = 30): Promise<any[]> {
    this.logger.log(`⚠️  [BUSINESS RULE] Checking expiring products - Store: ${storeId}, Days: ${daysAhead}`);

    const stocks = await this.stockRepository.findByStore(storeId);
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + daysAhead);

    const expiringProducts = stocks
      .filter((stock) => {
        if (!stock.product) return false;
        const product = stock.product as any;
        if (!product.expiryDate) return false;
        const expiryDate = new Date(product.expiryDate);
        return expiryDate >= today && expiryDate <= futureDate;
      })
      .map((stock) => {
        const product = stock.product as any;
        return {
          productId: stock.productId,
          productName: stock.product.name,
          batchNumber: product.batchNumber || null,
          expiryDate: product.expiryDate,
          quantity: stock.quantity,
          daysToExpire: Math.ceil(
            (new Date(product.expiryDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
          ),
        };
      });

    if (expiringProducts.length > 0) {
      this.logger.warn(
        `⚠️  [BUSINESS RULE] EXPIRING_PRODUCTS - ${expiringProducts.length} products expiring in ${daysAhead} days`,
      );
    }

    return expiringProducts;
  }
}

