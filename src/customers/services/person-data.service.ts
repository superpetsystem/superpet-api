import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PersonDataRepository } from '../repositories/person-data.repository';
import { PersonDataEntity } from '../entities/person-data.entity';
import { CreatePersonDataDto } from '../dto/create-person-data.dto';
import { UpdatePersonDataDto } from '../dto/update-person-data.dto';

@Injectable()
export class PersonDataService {
  constructor(private readonly personDataRepository: PersonDataRepository) {}

  async create(customerId: string, createPersonDataDto: CreatePersonDataDto): Promise<PersonDataEntity> {
    // Verificar se o documento já existe
    const existingPersonData = await this.personDataRepository.findByDocumentNumber(
      createPersonDataDto.documentNumber,
    );

    if (existingPersonData) {
      throw new BadRequestException('Document number already registered');
    }

    try {
      return await this.personDataRepository.create({
        ...createPersonDataDto,
        customerId,
      });
    } catch (error) {
      throw new BadRequestException('Failed to create person data');
    }
  }

  async findByCustomerId(customerId: string): Promise<PersonDataEntity> {
    const personData = await this.personDataRepository.findByCustomerId(customerId);
    if (!personData) {
      throw new NotFoundException(`Person data for customer ${customerId} not found`);
    }
    return personData;
  }

  async update(id: string, updatePersonDataDto: UpdatePersonDataDto): Promise<PersonDataEntity> {
    const personData = await this.personDataRepository.findById(id);
    if (!personData) {
      throw new NotFoundException(`Person data with ID ${id} not found`);
    }

    // Se está atualizando o documento, verificar se não existe outro com o mesmo número
    if (updatePersonDataDto.documentNumber && updatePersonDataDto.documentNumber !== personData.documentNumber) {
      const existingPersonData = await this.personDataRepository.findByDocumentNumber(
        updatePersonDataDto.documentNumber,
      );
      if (existingPersonData) {
        throw new BadRequestException('Document number already registered');
      }
    }

    const updatedPersonData = await this.personDataRepository.update(id, updatePersonDataDto);
    if (!updatedPersonData) {
      throw new NotFoundException(`Person data with ID ${id} not found after update`);
    }
    return updatedPersonData;
  }

  async delete(id: string): Promise<void> {
    const personData = await this.personDataRepository.findById(id);
    if (!personData) {
      throw new NotFoundException(`Person data with ID ${id} not found`);
    }

    await this.personDataRepository.delete(id);
  }
}

