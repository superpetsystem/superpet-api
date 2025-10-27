import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequireFeature } from '../common/guards/feature.guard';
import { FeatureGuard } from '../common/guards/feature.guard';
import { PickupService } from './services/pickup.service';
import { CreatePickupDto } from './dto/create-pickup.dto';
import { PickupEntity, PickupStatus } from './entities/pickup.entity';
import { FeatureKey } from '../stores/entities/store-feature.entity';

@Controller('stores/:storeId/pickups')
@UseGuards(JwtAuthGuard)
@RequireFeature(FeatureKey.TELEPICKUP)
@UseGuards(FeatureGuard)
export class PickupsController {
  constructor(private readonly pickupService: PickupService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Param('storeId') storeId: string,
    @Query('date') date?: string,
  ): Promise<PickupEntity[]> {
    return this.pickupService.findByStore(storeId, date);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('storeId') storeId: string,
    @Body() dto: CreatePickupDto,
  ): Promise<PickupEntity> {
    return this.pickupService.create(storeId, dto);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: PickupStatus,
  ): Promise<PickupEntity> {
    return this.pickupService.updateStatus(id, status);
  }
}




