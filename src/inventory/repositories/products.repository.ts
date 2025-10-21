import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ProductEntity, ProductCategory } from '../entities/product.entity';

@Injectable()
export class ProductsRepository {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly repository: Repository<ProductEntity>,
  ) {}

  async create(data: Partial<ProductEntity>): Promise<ProductEntity> {
    const product = this.repository.create(data);
    return this.repository.save(product);
  }

  async findById(id: string): Promise<ProductEntity | null> {
    return this.repository.findOne({
      where: { id },
    });
  }

  async findByOrganization(
    organizationId: string,
    filters?: { category?: ProductCategory; active?: boolean; query?: string },
  ): Promise<ProductEntity[]> {
    const query = this.repository
      .createQueryBuilder('product')
      .where('product.organization_id = :organizationId', { organizationId });

    if (filters?.category) {
      query.andWhere('product.category = :category', { category: filters.category });
    }

    if (filters?.active !== undefined) {
      query.andWhere('product.active = :active', { active: filters.active });
    }

    if (filters?.query) {
      query.andWhere(
        '(product.name LIKE :query OR product.code LIKE :query OR product.description LIKE :query)',
        { query: `%${filters.query}%` },
      );
    }

    return query.getMany();
  }

  async findByCode(organizationId: string, code: string): Promise<ProductEntity | null> {
    return this.repository.findOne({
      where: { organizationId, code },
    });
  }

  async update(id: string, data: Partial<ProductEntity>): Promise<ProductEntity | null> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }
}

