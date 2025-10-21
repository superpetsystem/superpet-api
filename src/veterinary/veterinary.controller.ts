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
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard, Roles } from '../common/guards/role.guard';
import { FeatureGuard, RequireFeature } from '../common/guards/feature.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { EmployeeRole } from '../employees/entities/employee.entity';
import { VeterinaryService } from './services/veterinary.service';
import { CreateVeterinaryRecordDto } from './dto/create-veterinary-record.dto';
import { CreateVaccinationDto } from './dto/create-vaccination.dto';

@Controller('v1/veterinary')
@UseGuards(JwtAuthGuard, FeatureGuard)
@RequireFeature('VETERINARY_RECORDS' as any)
export class VeterinaryController {
  private readonly logger = new Logger(VeterinaryController.name);

  constructor(private readonly veterinaryService: VeterinaryService) {}

  // ========== VETERINARY RECORDS ==========

  @Post('records')
  @HttpCode(HttpStatus.CREATED)
  @Roles(EmployeeRole.OWNER, EmployeeRole.ADMIN, EmployeeRole.STAFF)
  @UseGuards(RoleGuard)
  async createRecord(@CurrentUser() user: any, @Body() dto: CreateVeterinaryRecordDto) {
    this.logger.log(`🏥 Create veterinary record - Pet: ${dto.petId}, Type: ${dto.type}`);

    const record = await this.veterinaryService.createRecord(user.organizationId, dto);

    this.logger.log(`✅ Record created - ID: ${record.id}`);
    return record;
  }

  @Get('records/:id')
  @HttpCode(HttpStatus.OK)
  async getRecord(@CurrentUser() user: any, @Param('id') id: string) {
    this.logger.log(`🔍 Get veterinary record - ID: ${id}`);

    const record = await this.veterinaryService.findRecordById(id);

    this.logger.log(`✅ Record found - ID: ${id}`);
    return record;
  }

  @Get('pets/:petId/records')
  @HttpCode(HttpStatus.OK)
  async getPetRecords(@CurrentUser() user: any, @Param('petId') petId: string) {
    this.logger.log(`📋 List pet records - Pet: ${petId}`);

    const records = await this.veterinaryService.findRecordsByPet(petId);

    this.logger.log(`✅ Found ${records.length} records`);
    return records;
  }

  @Put('records/:id')
  @HttpCode(HttpStatus.OK)
  @Roles(EmployeeRole.OWNER, EmployeeRole.ADMIN, EmployeeRole.STAFF)
  @UseGuards(RoleGuard)
  async updateRecord(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: Partial<CreateVeterinaryRecordDto>,
  ) {
    this.logger.log(`📝 Update veterinary record - ID: ${id}`);

    const record = await this.veterinaryService.updateRecord(id, dto);

    this.logger.log(`✅ Record updated - ID: ${id}`);
    return record;
  }

  // ========== VACCINATIONS ==========

  @Post('vaccinations')
  @HttpCode(HttpStatus.CREATED)
  @Roles(EmployeeRole.OWNER, EmployeeRole.ADMIN, EmployeeRole.STAFF)
  @UseGuards(RoleGuard)
  async createVaccination(@CurrentUser() user: any, @Body() dto: CreateVaccinationDto) {
    this.logger.log(`💉 Create vaccination - Pet: ${dto.petId}, Vaccine: ${dto.vaccineName}`);

    const vaccination = await this.veterinaryService.createVaccination(
      user.organizationId,
      user.employee.id,
      dto,
    );

    this.logger.log(`✅ Vaccination created - ID: ${vaccination.id}`);
    return vaccination;
  }

  @Get('pets/:petId/vaccinations')
  @HttpCode(HttpStatus.OK)
  async getPetVaccinations(@CurrentUser() user: any, @Param('petId') petId: string) {
    this.logger.log(`📋 List pet vaccinations - Pet: ${petId}`);

    const vaccinations = await this.veterinaryService.findVaccinationsByPet(petId);

    this.logger.log(`✅ Found ${vaccinations.length} vaccinations`);
    return vaccinations;
  }

  @Get('pets/:petId/vaccinations/upcoming')
  @HttpCode(HttpStatus.OK)
  async getUpcomingVaccinations(@CurrentUser() user: any, @Param('petId') petId: string) {
    this.logger.log(`📅 Get upcoming vaccinations - Pet: ${petId}`);

    const vaccinations = await this.veterinaryService.getUpcomingVaccinations(petId);

    this.logger.log(`✅ Found ${vaccinations.length} upcoming vaccinations`);
    return vaccinations;
  }
}

