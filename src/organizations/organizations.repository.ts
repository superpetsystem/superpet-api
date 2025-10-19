import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationEntity } from './entities/organization.entity';

@Injectable()
export class OrganizationsRepository {
  constructor(
    @InjectRepository(OrganizationEntity)
    private readonly repository: Repository<OrganizationEntity>,
  ) {}

  async create(data: Partial<OrganizationEntity>): Promise<OrganizationEntity> {
    const org = this.repository.create(data);
    return this.repository.save(org);
  }

  async findById(id: string): Promise<OrganizationEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findBySlug(slug: string): Promise<OrganizationEntity | null> {
    return this.repository.findOne({ where: { slug } });
  }

  async checkSlugExists(slug: string): Promise<boolean> {
    const count = await this.repository.count({ where: { slug } });
    return count > 0;
  }
}


