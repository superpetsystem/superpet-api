import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/guards/role.guard';
import { RoleGuard } from '../common/guards/role.guard';
import { RequireFeature } from '../common/guards/feature.guard';
import { FeatureGuard } from '../common/guards/feature.guard';
import { LiveCamService } from './services/live-cam.service';
import { CreateStreamDto } from './dto/create-stream.dto';
import { LiveCamStreamEntity } from './entities/live-cam-stream.entity';
import { FeatureKey } from '../stores/entities/store-feature.entity';
import { EmployeeRole } from '../employees/entities/employee.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('live-cam')
@UseGuards(JwtAuthGuard)
export class LiveCamController {
  constructor(private readonly liveCamService: LiveCamService) {}

  // OWNER/ADMIN criar streams
  @Post('stores/:storeId/streams')
  @Roles(EmployeeRole.OWNER, EmployeeRole.ADMIN)
  @UseGuards(RoleGuard)
  @RequireFeature(FeatureKey.LIVE_CAM)
  @UseGuards(FeatureGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('storeId') storeId: string,
    @Body() dto: CreateStreamDto,
  ): Promise<LiveCamStreamEntity> {
    return this.liveCamService.create(storeId, dto);
  }

  // Cliente ver streams do seu pet
  @Get('customers/:customerId/pets/:petId')
  @HttpCode(HttpStatus.OK)
  async findByPet(
    @Param('customerId') customerId: string,
    @Param('petId') petId: string,
  ): Promise<LiveCamStreamEntity[]> {
    return this.liveCamService.findByPet(customerId, petId);
  }

  // OWNER/ADMIN deletar stream
  @Delete('stores/:storeId/streams/:id')
  @Roles(EmployeeRole.OWNER, EmployeeRole.ADMIN)
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    return this.liveCamService.delete(id);
  }
}




