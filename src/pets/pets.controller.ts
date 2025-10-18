import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PetCreateService } from './services/pet-create.service';
import { PetGetService } from './services/pet-get.service';
import { PetUpdateService } from './services/pet-update.service';
import { PetDeleteService } from './services/pet-delete.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { PetEntity } from './entities/pet.entity';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';

@Controller('pets')
@UseGuards(JwtAuthGuard)
export class PetsController {
  constructor(
    private readonly petCreateService: PetCreateService,
    private readonly petGetService: PetGetService,
    private readonly petUpdateService: PetUpdateService,
    private readonly petDeleteService: PetDeleteService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPetDto: CreatePetDto): Promise<PetEntity> {
    return this.petCreateService.create(createPetDto);
  }

  @Get('all')
  @HttpCode(HttpStatus.OK)
  async findAllSimple(): Promise<PetEntity[]> {
    return this.petGetService.findAllSimple();
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() paginationDto: PaginationDto): Promise<PaginatedResult<PetEntity>> {
    return this.petGetService.findAll(paginationDto.page, paginationDto.limit);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id') id: string): Promise<PetEntity> {
    return this.petGetService.findById(id);
  }

  @Get('customer/:customerId')
  @HttpCode(HttpStatus.OK)
  async findByCustomerId(
    @Param('customerId') customerId: string,
  ): Promise<PetEntity[]> {
    return this.petGetService.findByCustomerId(customerId);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updatePetDto: UpdatePetDto,
  ): Promise<PetEntity> {
    return this.petUpdateService.update(id, updatePetDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    return this.petDeleteService.delete(id);
  }
}

