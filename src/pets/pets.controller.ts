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

@Controller('pets')
@UseGuards(JwtAuthGuard)
export class PetsController {
  constructor(private readonly petService: PetService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query('status') status?: PetStatus): Promise<PetEntity[]> {
    return this.petService.findAll(status);
  }

  @Get('customers/:customerId')
  @HttpCode(HttpStatus.OK)
  async findByCustomer(
    @Param('customerId') customerId: string,
    @Query('status') status?: PetStatus,
  ): Promise<PetEntity[]> {
    return this.petService.findByCustomer(customerId, status);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id') id: string): Promise<PetEntity> {
    return this.petService.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: any,
    @Body() dto: CreatePetDto,
  ): Promise<PetEntity> {
    return this.petService.create(user.organizationId, dto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePetDto,
  ): Promise<PetEntity> {
    return this.petService.update(id, dto);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: PetStatus,
  ): Promise<PetEntity> {
    return this.petService.updateStatus(id, status);
  }
}
