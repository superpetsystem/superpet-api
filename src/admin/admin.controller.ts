import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OrganizationsRepository } from '../organizations/organizations.repository';
import { UsersRepository } from '../users/users.repository';
import { EmployeesRepository } from '../employees/repositories/employees.repository';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { CreateOwnerDto } from './dto/create-owner.dto';
import { CreateStoreDto } from './dto/create-store.dto';
import { EnableFeatureDto } from './dto/enable-feature.dto';
import { UpdateFeatureLimitsDto } from './dto/update-feature-limits.dto';
import { StoresRepository } from '../stores/repositories/stores.repository';
import { StoreFeatureRepository } from '../stores/repositories/store-feature.repository';
import { FeatureEntity } from '../stores/entities/feature.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationStatus, OrganizationPlan } from '../organizations/entities/organization.entity';
import { UserStatus, UserRole } from '../users/entities/user.entity';
import { EmployeeRole, JobTitle } from '../employees/entities/employee.entity';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  private readonly logger = new Logger(AdminController.name);

  constructor(
    private readonly organizationsRepository: OrganizationsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly employeesRepository: EmployeesRepository,
    private readonly storesRepository: StoresRepository,
    private readonly storeFeatureRepository: StoreFeatureRepository,
    @InjectRepository(FeatureEntity)
    private readonly featureRepository: Repository<FeatureEntity>,
  ) {}

  // Verificar se é SUPER_ADMIN (role no USER, não Employee!)
  private ensureSuperAdmin(user: any) {
    this.logger.log(`🔍 [SUPER_ADMIN CHECK] UserID: ${user.id}, Role: ${user.role}`);
    
    if (user.role !== UserRole.SUPER_ADMIN) {
      this.logger.error(`❌ Unauthorized SUPER_ADMIN access attempt - UserID: ${user.id}, Role: ${user.role}`);
      throw new ForbiddenException('SUPER_ADMIN_ONLY: This action requires SUPER_ADMIN role');
    }
  }

  @Get('organizations')
  @HttpCode(HttpStatus.OK)
  async listOrganizations(@CurrentUser() user: any) {
    this.ensureSuperAdmin(user);
    
    this.logger.log(`📋 List all organizations - SUPER_ADMIN: ${user.id}`);

    const organizations = await this.organizationsRepository.findAll();

    this.logger.log(`✅ Found ${organizations.length} organizations`);
    return organizations;
  }

  @Post('organizations')
  @HttpCode(HttpStatus.CREATED)
  async createOrganization(@CurrentUser() user: any, @Body() dto: CreateOrganizationDto) {
    this.ensureSuperAdmin(user);
    
    this.logger.log(`🏢 Create organization - Name: ${dto.name}, Slug: ${dto.slug}`);

    const existing = await this.organizationsRepository.findBySlug(dto.slug);
    if (existing) {
      throw new ForbiddenException('ORGANIZATION_SLUG_TAKEN');
    }

    const organization = await this.organizationsRepository.create({
      id: uuidv4(),
      name: dto.name,
      slug: dto.slug,
      status: OrganizationStatus.ACTIVE,
      plan: dto.plan || OrganizationPlan.FREE,
      limits: dto.limits || {
        employees: 10,
        stores: 5,
        monthlyAppointments: 500,
      },
    });

    this.logger.log(`✅ Organization created - ID: ${organization.id}`);
    return organization;
  }

  @Post('organizations/:organizationId/owners')
  @HttpCode(HttpStatus.CREATED)
  async createOwner(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Body() dto: CreateOwnerDto,
  ) {
    this.ensureSuperAdmin(user);
    
    this.logger.log(`👤 [SUPER_ADMIN] Create OWNER for organization - OrgID: ${organizationId}, Email: ${dto.email}`);

    const organization = await this.organizationsRepository.findById(organizationId);
    if (!organization) {
      this.logger.error(`❌ Organization not found - ID: ${organizationId}`);
      throw new ForbiddenException('ORGANIZATION_NOT_FOUND');
    }

    // Verificar se email já existe
    const existingUser = await this.usersRepository.findByEmailGlobal(dto.email);
    if (existingUser) {
      this.logger.error(`❌ Email already exists - Email: ${dto.email}`);
      throw new ForbiddenException('EMAIL_ALREADY_EXISTS');
    }

    // Criar usuário (role USER, não SUPER_ADMIN!)
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const newUser = await this.usersRepository.create({
      id: uuidv4(),
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      organizationId: organizationId,
      status: UserStatus.ACTIVE,
      role: UserRole.USER, // OWNER é USER comum com employee.role = OWNER
    });

    // Criar employee OWNER (OWNER é global na org, sem store específica)
    const employee = await this.employeesRepository.create({
      id: uuidv4(),
      userId: newUser.id,
      organizationId: organizationId,
      role: EmployeeRole.OWNER,
      jobTitle: JobTitle.OWNER,
    });

    this.logger.log(`✅ [SUPER_ADMIN] OWNER created successfully`);
    this.logger.log(`   UserID: ${newUser.id}`);
    this.logger.log(`   EmployeeID: ${employee.id}`);
    this.logger.log(`   Organization: ${organization.name}`);

    return {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      employee: {
        id: employee.id,
        role: employee.role,
        jobTitle: employee.jobTitle,
      },
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
      },
    };
  }

  @Post('organizations/:organizationId/stores')
  @HttpCode(HttpStatus.CREATED)
  async createStore(
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
    @Body() dto: CreateStoreDto,
  ) {
    this.ensureSuperAdmin(user);
    
    this.logger.log(`🏪 [SUPER_ADMIN] Create store - OrgID: ${organizationId}, Code: ${dto.code}`);

    const organization = await this.organizationsRepository.findById(organizationId);
    if (!organization) {
      throw new ForbiddenException('ORGANIZATION_NOT_FOUND');
    }

    const store = await this.storesRepository.create({
      id: uuidv4(),
      organizationId: organizationId,
      code: dto.code,
      name: dto.name,
      timezone: dto.timezone,
      phone: dto.phone || null,
      email: dto.email || null,
      address: dto.address || null,
      openingHours: dto.openingHours,
      resourcesCatalog: dto.resourcesCatalog || [],
      capacity: dto.capacity || {},
      active: true,
    });

    this.logger.log(`✅ [SUPER_ADMIN] Store created - ID: ${store.id}`);
    return store;
  }

  // ========== FEATURE MANAGEMENT ==========

  @Get('features')
  @HttpCode(HttpStatus.OK)
  async listFeatures(@CurrentUser() user: any) {
    this.ensureSuperAdmin(user);
    this.logger.log(`📋 [SUPER_ADMIN] Listing all features`);

    const features = await this.featureRepository.find({
      order: { category: 'ASC', createdAt: 'ASC' },
    });

    this.logger.log(`✅ Found ${features.length} features`);
    return features;
  }

  @Get('stores/:storeId/features')
  @HttpCode(HttpStatus.OK)
  async listStoreFeatures(@CurrentUser() user: any, @Param('storeId') storeId: string) {
    this.ensureSuperAdmin(user);
    this.logger.log(`📋 [SUPER_ADMIN] Listing features for store: ${storeId}`);

    const store = await this.storesRepository.findById(storeId);
    if (!store) {
      throw new ForbiddenException('STORE_NOT_FOUND');
    }

    const storeFeatures = await this.storeFeatureRepository.findByStore(storeId);

    this.logger.log(`✅ Found ${storeFeatures.length} features for store`);
    return {
      store: {
        id: store.id,
        name: store.name,
        organizationId: store.organizationId,
      },
      features: storeFeatures,
    };
  }

  @Get('organizations/:organizationId/stores-features')
  @HttpCode(HttpStatus.OK)
  async listOrganizationStoresFeatures(@CurrentUser() user: any, @Param('organizationId') organizationId: string) {
    this.ensureSuperAdmin(user);
    this.logger.log(`📋 [SUPER_ADMIN] Listing all stores and features for org: ${organizationId}`);

    const organization = await this.organizationsRepository.findById(organizationId);
    if (!organization) {
      throw new ForbiddenException('ORGANIZATION_NOT_FOUND');
    }

    // Buscar todas as lojas da organização
    const stores = await this.storesRepository.findByOrganization(organizationId);

    // Buscar features de cada loja
    const storesWithFeatures = await Promise.all(
      stores.map(async (store) => {
        const features = await this.storeFeatureRepository.findByStore(store.id);
        return {
          id: store.id,
          code: store.code,
          name: store.name,
          active: store.active,
          featuresCount: features.length,
          enabledFeatures: features.filter((f) => f.enabled).length,
          features: features.map((f) => ({
            key: f.featureKey,
            name: f.feature?.name || f.featureKey,
            enabled: f.enabled,
            limits: f.limits,
          })),
        };
      }),
    );

    this.logger.log(`✅ Found ${stores.length} stores with features`);
    return {
      organization: {
        id: organization.id,
        name: organization.name,
        plan: organization.plan,
      },
      stores: storesWithFeatures,
    };
  }

  @Post('stores/:storeId/features/:key')
  @HttpCode(HttpStatus.OK)
  async enableStoreFeature(
    @CurrentUser() user: any,
    @Param('storeId') storeId: string,
    @Param('key') featureKey: string,
    @Body() dto: EnableFeatureDto,
  ) {
    this.ensureSuperAdmin(user);

    this.logger.log(`🎯 [SUPER_ADMIN] ${dto.enabled ? 'Enabling' : 'Disabling'} feature ${featureKey} for store ${storeId}`);

    // Verificar se store existe
    const store = await this.storesRepository.findById(storeId);
    if (!store) {
      this.logger.error(`❌ Store not found - ID: ${storeId}`);
      throw new ForbiddenException('STORE_NOT_FOUND');
    }

    // Verificar se feature existe
    const feature = await this.featureRepository.findOne({ where: { key: featureKey } });
    if (!feature) {
      this.logger.error(`❌ Feature not found - Key: ${featureKey}`);
      throw new ForbiddenException('FEATURE_NOT_FOUND');
    }

    // Habilitar/desabilitar feature
    const storeFeature = await this.storeFeatureRepository.upsert(
      storeId,
      featureKey,
      'STORE' as any, // Usar STORE como padrão para admin
      dto.enabled,
      dto.limits || feature.defaultLimits,
    );

    this.logger.log(`✅ [SUPER_ADMIN] Feature ${featureKey} ${dto.enabled ? 'enabled' : 'disabled'} for store`);

    return {
      store: {
        id: store.id,
        name: store.name,
      },
      feature: {
        key: featureKey,
        name: feature.name,
        enabled: storeFeature.enabled,
        limits: storeFeature.limits,
      },
    };
  }

  @Put('stores/:storeId/features/:key/limits')
  @HttpCode(HttpStatus.OK)
  async updateFeatureLimits(
    @CurrentUser() user: any,
    @Param('storeId') storeId: string,
    @Param('key') featureKey: string,
    @Body() dto: UpdateFeatureLimitsDto,
  ) {
    this.ensureSuperAdmin(user);

    this.logger.log(`🔧 [SUPER_ADMIN] Updating limits for feature ${featureKey} on store ${storeId}`);

    // Verificar se store existe
    const store = await this.storesRepository.findById(storeId);
    if (!store) {
      throw new ForbiddenException('STORE_NOT_FOUND');
    }

    // Verificar se feature está habilitada
    const storeFeature = await this.storeFeatureRepository.findByStoreAndKey(storeId, featureKey);
    if (!storeFeature) {
      this.logger.error(`❌ Feature not enabled for store - Key: ${featureKey}`);
      throw new ForbiddenException('FEATURE_NOT_ENABLED');
    }

    // Atualizar limites
    const updated = await this.storeFeatureRepository.upsert(storeId, featureKey, 'STORE' as any, storeFeature.enabled, dto.limits);

    this.logger.log(`✅ [SUPER_ADMIN] Feature limits updated`);

    return {
      store: {
        id: store.id,
        name: store.name,
      },
      feature: {
        key: featureKey,
        enabled: updated.enabled,
        limits: updated.limits,
      },
    };
  }

  @Delete('stores/:storeId/features/:key')
  @HttpCode(HttpStatus.OK)
  async disableStoreFeature(
    @CurrentUser() user: any,
    @Param('storeId') storeId: string,
    @Param('key') featureKey: string,
  ) {
    this.ensureSuperAdmin(user);

    this.logger.log(`❌ [SUPER_ADMIN] Disabling feature ${featureKey} for store ${storeId}`);

    // Verificar se store existe
    const store = await this.storesRepository.findById(storeId);
    if (!store) {
      throw new ForbiddenException('STORE_NOT_FOUND');
    }

    // Desabilitar feature
    const storeFeature = await this.storeFeatureRepository.upsert(storeId, featureKey, 'STORE' as any, false, null);

    this.logger.log(`✅ [SUPER_ADMIN] Feature ${featureKey} disabled`);

    return {
      store: {
        id: store.id,
        name: store.name,
      },
      feature: {
        key: featureKey,
        enabled: false,
      },
    };
  }
}


