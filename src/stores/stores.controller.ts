import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/guards/role.guard';
import { RoleGuard } from '../common/guards/role.guard';
import { StoreService } from './services/store.service';
import { StoreFeatureService } from './services/store-feature.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { ConfigureFeatureDto } from './dto/configure-feature.dto';
import { StoreEntity } from './entities/store.entity';
import { StoreFeatureEntity } from './entities/store-feature.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { EmployeeRole } from '../employees/entities/employee.entity';

@Controller('v1/stores')
@UseGuards(JwtAuthGuard)
export class StoresController {
  constructor(
    private readonly storeService: StoreService,
    private readonly storeFeatureService: StoreFeatureService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @CurrentUser() user: any,
    @Query('active') active?: string,
  ): Promise<StoreEntity[]> {
    const activeFilter = active !== undefined ? active === 'true' : undefined;
    return this.storeService.findByOrganization(user.organizationId, activeFilter);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findById(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ): Promise<StoreEntity> {
    const store = await this.storeService.findById(id);
    
    // Validar que a store pertence à mesma organização
    if (!store || store.organizationId !== user.organizationId) {
      throw new NotFoundException('Store not found'); // Retornar 404 para não vazar que existe
    }
    
    return store;
  }

  @Post()
  @Roles(EmployeeRole.OWNER, EmployeeRole.ADMIN)
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: any,
    @Body() dto: CreateStoreDto,
  ): Promise<StoreEntity> {
    return this.storeService.create(user.organizationId, dto);
  }

  @Put(':id')
  @Roles(EmployeeRole.OWNER, EmployeeRole.ADMIN)
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<StoreEntity>,
  ): Promise<StoreEntity> {
    return this.storeService.update(id, dto);
  }

  @Patch(':id/status')
  @Roles(EmployeeRole.OWNER, EmployeeRole.ADMIN)
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @Param('id') id: string,
    @Body('active') active: boolean,
  ): Promise<StoreEntity> {
    return this.storeService.updateStatus(id, active);
  }

  @Put(':id/opening-hours')
  @Roles(EmployeeRole.OWNER, EmployeeRole.ADMIN)
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  async updateOpeningHours(
    @Param('id') id: string,
    @Body('openingHours') openingHours: any,
  ): Promise<StoreEntity> {
    return this.storeService.update(id, { openingHours });
  }

  @Put(':id/capacity')
  @Roles(EmployeeRole.OWNER, EmployeeRole.ADMIN)
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  async updateCapacity(
    @Param('id') id: string,
    @Body() data: { resourcesCatalog?: string[]; capacity?: any },
  ): Promise<StoreEntity> {
    return this.storeService.update(id, data);
  }

  @Put(':id/blackouts')
  @Roles(EmployeeRole.OWNER, EmployeeRole.ADMIN)
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  async updateBlackouts(
    @Param('id') id: string,
    @Body('blackoutDates') blackoutDates: string[],
  ): Promise<StoreEntity> {
    return this.storeService.update(id, { blackoutDates });
  }

  // ===== FEATURES =====
  
  @Get(':storeId/features')
  @HttpCode(HttpStatus.OK)
  async getFeatures(@Param('storeId') storeId: string): Promise<StoreFeatureEntity[]> {
    return this.storeFeatureService.findByStore(storeId);
  }

  @Put(':storeId/features/:key')
  @Roles(EmployeeRole.OWNER, EmployeeRole.ADMIN)
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  async configureFeature(
    @Param('storeId') storeId: string,
    @Param('key') key: string,
    @Body() dto: ConfigureFeatureDto,
  ): Promise<StoreFeatureEntity> {
    return this.storeFeatureService.configureFeature(storeId, key, dto.enabled, dto.limits);
  }
}
