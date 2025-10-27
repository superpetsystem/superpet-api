import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard, Roles } from '../common/guards/role.guard';
import { OrganizationsRepository } from './organizations.repository';
import { OrganizationEntity } from './entities/organization.entity';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Controller('organizations')
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles('SUPER_ADMIN' as any)
export class OrganizationsController {
  private readonly logger = new Logger(OrganizationsController.name);

  constructor(
    private readonly organizationsRepository: OrganizationsRepository,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<OrganizationEntity[]> {
    return this.organizationsRepository.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id') id: string): Promise<OrganizationEntity> {
    const organization = await this.organizationsRepository.findById(id);
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }
    return organization;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateOrganizationDto): Promise<OrganizationEntity> {
    this.logger.log(`Creating organization: ${dto.name}`);
    return this.organizationsRepository.create(dto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateOrganizationDto,
  ): Promise<OrganizationEntity> {
    this.logger.log(`Updating organization: ${id}`);
    const organization = await this.organizationsRepository.findById(id);
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }
    return this.organizationsRepository.update(id, dto);
  }
}
