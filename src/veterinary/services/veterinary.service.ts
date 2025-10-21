import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { VeterinaryRecordRepository } from '../repositories/veterinary-record.repository';
import { VaccinationRepository } from '../repositories/vaccination.repository';
import { CreateVeterinaryRecordDto } from '../dto/create-veterinary-record.dto';
import { CreateVaccinationDto } from '../dto/create-vaccination.dto';
import { VeterinaryRecordEntity } from '../entities/veterinary-record.entity';
import { VaccinationEntity } from '../entities/vaccination.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class VeterinaryService {
  private readonly logger = new Logger(VeterinaryService.name);

  constructor(
    private readonly recordRepository: VeterinaryRecordRepository,
    private readonly vaccinationRepository: VaccinationRepository,
  ) {}

  async createRecord(organizationId: string, dto: CreateVeterinaryRecordDto): Promise<VeterinaryRecordEntity> {
    this.logger.log(
      `🏥 [BUSINESS RULE] Creating veterinary record - Pet: ${dto.petId}, Type: ${dto.type}, Vet: ${dto.veterinarianId}`,
    );

    const record = await this.recordRepository.create({
      id: uuidv4(),
      organizationId,
      petId: dto.petId,
      storeId: dto.storeId,
      veterinarianId: dto.veterinarianId,
      type: dto.type,
      visitDate: new Date(dto.visitDate),
      reason: dto.reason,
      symptoms: dto.symptoms || null,
      diagnosis: dto.diagnosis || null,
      treatment: dto.treatment || null,
      prescriptions: dto.prescriptions || null,
      weightKg: dto.weightKg || null,
      temperatureCelsius: dto.temperatureCelsius || null,
      notes: dto.notes || null,
    });

    this.logger.log(`✅ [BUSINESS RULE] Veterinary record created - ID: ${record.id}`);
    return record;
  }

  async findRecordById(id: string): Promise<VeterinaryRecordEntity> {
    const record = await this.recordRepository.findById(id);
    if (!record) {
      throw new NotFoundException('RECORD_NOT_FOUND');
    }
    return record;
  }

  async findRecordsByPet(petId: string): Promise<VeterinaryRecordEntity[]> {
    return this.recordRepository.findByPet(petId);
  }

  async updateRecord(id: string, dto: Partial<CreateVeterinaryRecordDto>): Promise<VeterinaryRecordEntity> {
    this.logger.log(`📝 Update veterinary record - ID: ${id}`);
    await this.findRecordById(id); // Ensure exists

    const updated = await this.recordRepository.update(id, dto as any);
    this.logger.log(`✅ Record updated - ID: ${id}`);
    return updated!;
  }

  async createVaccination(organizationId: string, employeeId: string, dto: CreateVaccinationDto): Promise<VaccinationEntity> {
    this.logger.log(`💉 [BUSINESS RULE] Creating vaccination - Pet: ${dto.petId}, Vaccine: ${dto.vaccineName}`);

    const vaccination = await this.vaccinationRepository.create({
      id: uuidv4(),
      petId: dto.petId,
      vaccineName: dto.vaccineName,
      manufacturer: dto.manufacturer || null,
      batchNumber: dto.batchNumber || null,
      applicationDate: new Date(dto.applicationDate),
      nextDoseDate: dto.nextDoseDate ? new Date(dto.nextDoseDate) : null,
      veterinarianId: employeeId,
      notes: dto.notes || null,
    });

    this.logger.log(`✅ [BUSINESS RULE] Vaccination created - ID: ${vaccination.id}`);
    return vaccination;
  }

  async findVaccinationsByPet(petId: string): Promise<VaccinationEntity[]> {
    return this.vaccinationRepository.findByPet(petId);
  }

  async getUpcomingVaccinations(petId: string): Promise<VaccinationEntity[]> {
    this.logger.log(`📅 Getting upcoming vaccinations - Pet: ${petId}`);
    return this.vaccinationRepository.getUpcoming(petId);
  }
}

