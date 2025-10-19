import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PersonDataRepository } from '../repositories/person-data.repository';
import { CreatePersonDataDto } from '../dto/create-person-data.dto';
import { PersonDataEntity } from '../entities/person-data.entity';

@Injectable()
export class PersonDataService {
  constructor(private readonly personDataRepository: PersonDataRepository) {}

  private validateCpf(cpf: string): boolean {
    // Validação simplificada de CPF (11 dígitos)
    if (!/^\d{11}$/.test(cpf)) return false;

    // TODO: Implementar validação completa de DV
    // Por enquanto, aceitar se tiver 11 dígitos
    return true;
  }

  async create(customerId: string, dto: CreatePersonDataDto): Promise<PersonDataEntity> {
    // Validar CPF
    if (dto.cpf) {
      if (!this.validateCpf(dto.cpf)) {
        throw new BadRequestException('CPF_INVALID');
      }

      const cpfExists = await this.personDataRepository.checkCpfExists(dto.cpf);
      if (cpfExists) {
        throw new BadRequestException('CPF_TAKEN');
      }
    }

    // Validar birthdate
    if (dto.birthdate) {
      const birthDate = new Date(dto.birthdate);
      const today = new Date();

      if (birthDate > today) {
        throw new BadRequestException('BIRTHDATE_INVALID');
      }

      // Se < 18 anos, exigir guardianName
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 18 && !dto.guardianName) {
        throw new BadRequestException('INSUFFICIENT_CONSENT');
      }
    }

    return this.personDataRepository.create({
      customerId,
      cpf: dto.cpf || null,
      rg: dto.rg || null,
      issuer: dto.issuer || null,
      birthdate: dto.birthdate ? new Date(dto.birthdate) : null,
      gender: dto.gender || null,
      guardianName: dto.guardianName || null,
      guardianPhone: dto.guardianPhone || null,
      notes: dto.notes || null,
    });
  }

  async findByCustomerId(customerId: string): Promise<PersonDataEntity | null> {
    return this.personDataRepository.findByCustomerId(customerId);
  }

  async update(customerId: string, dto: Partial<PersonDataEntity>): Promise<PersonDataEntity> {
    // Validar CPF se fornecido
    if (dto.cpf) {
      if (!this.validateCpf(dto.cpf)) {
        throw new BadRequestException('CPF_INVALID');
      }

      const cpfExists = await this.personDataRepository.checkCpfExists(dto.cpf, customerId);
      if (cpfExists) {
        throw new BadRequestException('CPF_TAKEN');
      }
    }

    const existing = await this.personDataRepository.findByCustomerId(customerId);

    if (existing) {
      const updated = await this.personDataRepository.update(customerId, dto);
      if (!updated) {
        throw new NotFoundException('NOT_FOUND');
      }
      return updated;
    }

    // Criar se não existe
    return this.personDataRepository.create({
      customerId,
      ...dto,
    } as PersonDataEntity);
  }
}
