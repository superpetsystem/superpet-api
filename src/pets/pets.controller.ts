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
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PetService } from './services/pet.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { PetEntity, PetStatus } from './entities/pet.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('v1')
@UseGuards(JwtAuthGuard)
export class PetsController {
  constructor(private readonly petService: PetService) {}

  @Get('customers/:customerId/pets')
  @HttpCode(HttpStatus.OK)
  async findByCustomer(
    @Param('customerId') customerId: string,
    @Query('status') status?: PetStatus,
  ): Promise<PetEntity[]> {
    return this.petService.findByCustomer(customerId, status);
  }

  @Get('pets/:id')
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id') id: string): Promise<PetEntity> {
    return this.petService.findById(id);
  }

  @Post('customers/:customerId/pets')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: any,
    @Param('customerId') customerId: string,
    @Body() dto: CreatePetDto,
  ): Promise<PetEntity> {
    return this.petService.create(user.organizationId, customerId, dto);
  }

  @Put('pets/:id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePetDto,
  ): Promise<PetEntity> {
    return this.petService.update(id, dto);
  }

  @Patch('pets/:id/status')
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: PetStatus,
  ): Promise<PetEntity> {
    return this.petService.updateStatus(id, status);
  }
}
