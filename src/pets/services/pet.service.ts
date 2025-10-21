import { Injectable, BadRequestException, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PetsRepository } from '../repositories/pets.repository';
import { CustomersRepository } from '../../customers/repositories/customers.repository';
import { CreatePetDto } from '../dto/create-pet.dto';
import { UpdatePetDto } from '../dto/update-pet.dto';
import { PetEntity, PetStatus, PetSpecies } from '../entities/pet.entity';
import { CustomerStatus } from '../../customers/entities/customer.entity';

@Injectable()
export class PetService {
  private readonly logger = new Logger(PetService.name);
  
  constructor(
    private readonly petsRepository: PetsRepository,
    private readonly customersRepository: CustomersRepository,
  ) {}

  async create(organizationId: string, customerId: string, dto: CreatePetDto): Promise<PetEntity> {
    this.logger.log(`🔍 [BUSINESS RULE] Validating pet creation - Name: ${dto.name}, Species: ${dto.species}, Weight: ${dto.weightKg}kg, CustomerID: ${customerId}`);
    
    // Validar customer ativo
    const customer = await this.customersRepository.findById(customerId);
    if (!customer) {
      this.logger.error(`❌ [BUSINESS RULE] CUSTOMER_NOT_FOUND - CustomerID: ${customerId}`);
      throw new NotFoundException('Customer not found');
    }

    if (customer.status !== CustomerStatus.ACTIVE) {
      this.logger.error(`❌ [BUSINESS RULE] CUSTOMER_INACTIVE - Cannot register pet for inactive customer - CustomerID: ${customerId}, Status: ${customer.status}`);
      throw new ForbiddenException('CUSTOMER_INACTIVE: Cannot register pets for inactive customers');
    }

    // Validar species
    if (!Object.values(PetSpecies).includes(dto.species)) {
      this.logger.error(`❌ [BUSINESS RULE] INVALID_SPECIES - Species: ${dto.species}, Allowed: ${Object.values(PetSpecies).join(', ')}`);
      throw new BadRequestException('INVALID_SPECIES: Must be DOG, CAT, BIRD, REPTILE, RODENT, FISH, or OTHER');
    }

    // Validar weightKg
    if (dto.weightKg !== undefined) {
      if (dto.weightKg < 0 || dto.weightKg > 200) {
        this.logger.error(`❌ [BUSINESS RULE] INVALID_WEIGHT - Weight: ${dto.weightKg}kg, Range: 0-200kg - Pet: ${dto.name}`);
        throw new BadRequestException('INVALID_WEIGHT: Weight must be between 0 and 200kg');
      }
      this.logger.log(`✅ [BUSINESS RULE] Weight validation passed - ${dto.weightKg}kg`);
    }

    // Validar microchip único
    if (dto.microchip) {
      const microchipExists = await this.petsRepository.checkMicrochipExists(organizationId, dto.microchip);
      if (microchipExists) {
        this.logger.error(`❌ [BUSINESS RULE] MICROCHIP_TAKEN - Microchip: ${dto.microchip}, OrgID: ${organizationId}`);
        throw new BadRequestException('MICROCHIP_TAKEN: Microchip number already registered');
      }
    }
    
    this.logger.log(`✅ [BUSINESS RULE] Pet validation passed - Name: ${dto.name}, Species: ${dto.species}`);

    return this.petsRepository.create({
      organizationId,
      customerId,
      name: dto.name,
      species: dto.species,
      breed: dto.breed || null,
      birthdate: dto.birthdate ? new Date(dto.birthdate) : null,
      weightKg: dto.weightKg || null,
      allergies: dto.allergies || null,
      microchip: dto.microchip || null,
      notes: dto.notes || null,
      status: PetStatus.ACTIVE,
    });
  }

  async findById(id: string): Promise<PetEntity> {
    const pet = await this.petsRepository.findById(id);
    if (!pet) {
      throw new NotFoundException('NOT_FOUND');
    }
    return pet;
  }

  async findByCustomer(customerId: string, status?: PetStatus): Promise<PetEntity[]> {
    return this.petsRepository.findByCustomer(customerId, status);
  }

  async update(id: string, dto: UpdatePetDto): Promise<PetEntity> {
    this.logger.log(`🔍 [BUSINESS RULE] Validating pet update - PetID: ${id}, Changes: ${JSON.stringify(dto)}`);
    
    const pet = await this.findById(id);

    // Validar weightKg
    if (dto.weightKg !== undefined) {
      if (dto.weightKg < 0 || dto.weightKg > 200) {
        this.logger.error(`❌ [BUSINESS RULE] INVALID_WEIGHT - Weight: ${dto.weightKg}kg, Range: 0-200kg - PetID: ${id}`);
        throw new BadRequestException('INVALID_WEIGHT: Weight must be between 0 and 200kg');
      }
      this.logger.log(`✅ [BUSINESS RULE] Weight validation passed - New weight: ${dto.weightKg}kg`);
    }

    // Validar microchip único
    if (dto.microchip && dto.microchip !== pet.microchip) {
      const microchipExists = await this.petsRepository.checkMicrochipExists(
        pet.organizationId,
        dto.microchip,
        id,
      );
      if (microchipExists) {
        this.logger.error(`❌ [BUSINESS RULE] MICROCHIP_TAKEN - Microchip: ${dto.microchip}, PetID: ${id}`);
        throw new BadRequestException('MICROCHIP_TAKEN: Microchip number already registered');
      }
    }

    const updateData: Partial<PetEntity> = {};
    if (dto.name) updateData.name = dto.name;
    if (dto.breed !== undefined) updateData.breed = dto.breed;
    if (dto.birthdate !== undefined) updateData.birthdate = new Date(dto.birthdate);
    if (dto.weightKg !== undefined) updateData.weightKg = dto.weightKg;
    if (dto.allergies !== undefined) updateData.allergies = dto.allergies;
    if (dto.microchip !== undefined) updateData.microchip = dto.microchip;
    if (dto.notes !== undefined) updateData.notes = dto.notes;

    const updated = await this.petsRepository.update(id, updateData);
    if (!updated) {
      throw new NotFoundException('NOT_FOUND');
    }

    return updated;
  }

  async updateStatus(id: string, status: PetStatus): Promise<PetEntity> {
    const updated = await this.petsRepository.update(id, { status });
    if (!updated) {
      throw new NotFoundException('NOT_FOUND');
    }
    return updated;
  }

  async checkCanSchedule(petId: string): Promise<void> {
    this.logger.log(`🔍 [BUSINESS RULE] Checking if pet can be scheduled - PetID: ${petId}`);
    
    const pet = await this.findById(petId);

    if (pet.status === PetStatus.DECEASED) {
      this.logger.error(`❌ [BUSINESS RULE] PET_DECEASED - Cannot schedule services for deceased pet - PetID: ${petId}, Name: ${pet.name}`);
      throw new ForbiddenException('PET_DECEASED: Cannot schedule services for deceased pets');
    }

    const customer = await this.customersRepository.findById(pet.customerId);
    if (customer && customer.status !== CustomerStatus.ACTIVE) {
      this.logger.error(`❌ [BUSINESS RULE] CUSTOMER_INACTIVE - Cannot schedule for inactive customer - PetID: ${petId}, CustomerID: ${customer.id}`);
      throw new ForbiddenException('CUSTOMER_INACTIVE: Cannot schedule services for inactive customers');
    }
    
    this.logger.log(`✅ [BUSINESS RULE] Pet can be scheduled - PetID: ${petId}, Name: ${pet.name}`);
  }
}

