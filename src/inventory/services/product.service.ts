import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { ProductsRepository } from '../repositories/products.repository';
import { CreateProductDto } from '../dto/create-product.dto';
import { ProductEntity, ProductUnit } from '../entities/product.entity';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(private readonly productsRepository: ProductsRepository) {}

  async create(organizationId: string, dto: CreateProductDto): Promise<ProductEntity> {
    this.logger.log(`🔍 [BUSINESS RULE] Creating product - Code: ${dto.code}, Name: ${dto.name}, OrgID: ${organizationId}`);

    // Validar código único
    const existing = await this.productsRepository.findByCode(organizationId, dto.code);
    if (existing) {
      this.logger.error(`❌ [BUSINESS RULE] PRODUCT_CODE_TAKEN - Code: ${dto.code}, OrgID: ${organizationId}`);
      throw new BadRequestException('PRODUCT_CODE_TAKEN: Product code already exists');
    }

    // Validar preços
    if (dto.costPriceCents && dto.salePriceCents) {
      if (dto.salePriceCents < dto.costPriceCents) {
        this.logger.warn(`⚠️  [BUSINESS RULE] PRICE_WARNING - Sale price lower than cost - Product: ${dto.name}`);
      }
    }

    this.logger.log(`✅ [BUSINESS RULE] Product validation passed - Code: ${dto.code}`);

    return this.productsRepository.create({
      organizationId,
      code: dto.code,
      name: dto.name,
      description: dto.description || null,
      category: dto.category,
      unit: dto.unit || ProductUnit.UNIT,
      costPriceCents: dto.costPriceCents || null,
      salePriceCents: dto.salePriceCents || null,
      minStock: dto.minStock || 0,
      active: dto.active !== undefined ? dto.active : true,
    });
  }

  async findById(id: string): Promise<ProductEntity> {
    const product = await this.productsRepository.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async findByOrganization(organizationId: string, filters?: any): Promise<ProductEntity[]> {
    return this.productsRepository.findByOrganization(organizationId, filters);
  }

  async update(id: string, data: Partial<ProductEntity>): Promise<ProductEntity> {
    const product = await this.findById(id);
    const updated = await this.productsRepository.update(id, data);
    if (!updated) {
      throw new NotFoundException('Product not found');
    }
    return updated;
  }

  async deactivate(id: string): Promise<ProductEntity> {
    return this.update(id, { active: false });
  }
}

