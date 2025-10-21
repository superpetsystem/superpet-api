import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { BookingRepository } from '../repositories/booking.repository';
import { CreateBookingDto } from '../dto/create-booking.dto';
import { BookingEntity, BookingStatus } from '../entities/booking.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);

  constructor(private readonly bookingRepository: BookingRepository) {}

  async create(organizationId: string, dto: CreateBookingDto): Promise<BookingEntity> {
    this.logger.log(
      `📅 [BUSINESS RULE] Creating booking - Store: ${dto.storeId}, Date: ${dto.bookingDate}, Time: ${dto.startTime}`,
    );

    // Calcular end_time baseado na duração do serviço (assumindo 1h padrão)
    const startHour = parseInt(dto.startTime.split(':')[0]);
    const startMinute = parseInt(dto.startTime.split(':')[1]);
    const endTime = `${String(startHour + 1).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`;

    // Verificar disponibilidade
    const isAvailable = await this.bookingRepository.checkAvailability(
      dto.storeId,
      new Date(dto.bookingDate),
      dto.startTime,
      endTime,
      dto.employeeId,
    );

    if (!isAvailable) {
      this.logger.error(`❌ [BUSINESS RULE] BOOKING_CONFLICT - Time slot not available`);
      throw new BadRequestException('BOOKING_CONFLICT: Time slot not available');
    }

    const booking = await this.bookingRepository.create({
      id: uuidv4(),
      organizationId,
      storeId: dto.storeId,
      customerId: dto.customerId,
      petId: dto.petId || null,
      serviceId: dto.serviceId,
      employeeId: dto.employeeId || null,
      bookingDate: new Date(dto.bookingDate),
      startTime: dto.startTime,
      endTime: endTime,
      priceCents: 5000, // TODO: Pegar do serviço
      status: BookingStatus.PENDING,
      notes: dto.notes || null,
    });

    this.logger.log(`✅ [BUSINESS RULE] Booking created successfully - ID: ${booking.id}`);
    return booking;
  }

  async findById(id: string): Promise<BookingEntity> {
    const booking = await this.bookingRepository.findById(id);
    if (!booking) {
      throw new NotFoundException('BOOKING_NOT_FOUND');
    }
    return booking;
  }

  async findByStore(storeId: string, date?: Date): Promise<BookingEntity[]> {
    return this.bookingRepository.findByStore(storeId, date);
  }

  async findByCustomer(customerId: string): Promise<BookingEntity[]> {
    return this.bookingRepository.findByCustomer(customerId);
  }

  async confirm(id: string): Promise<BookingEntity> {
    this.logger.log(`✅ [BUSINESS RULE] Confirming booking - ID: ${id}`);

    const booking = await this.findById(id);

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('INVALID_STATUS: Only pending bookings can be confirmed');
    }

    const updated = await this.bookingRepository.update(id, {
      status: BookingStatus.CONFIRMED,
      confirmedAt: new Date(),
    });

    this.logger.log(`✅ [BUSINESS RULE] Booking confirmed - ID: ${id}`);
    return updated!;
  }

  async cancel(id: string, reason: string): Promise<BookingEntity> {
    this.logger.log(`❌ [BUSINESS RULE] Cancelling booking - ID: ${id}, Reason: ${reason}`);

    const booking = await this.findById(id);

    if ([BookingStatus.COMPLETED, BookingStatus.CANCELLED].includes(booking.status)) {
      throw new BadRequestException('INVALID_STATUS: Cannot cancel completed or already cancelled booking');
    }

    const updated = await this.bookingRepository.update(id, {
      status: BookingStatus.CANCELLED,
      cancellationReason: reason,
    });

    this.logger.log(`✅ [BUSINESS RULE] Booking cancelled - ID: ${id}`);
    return updated!;
  }

  async complete(id: string): Promise<BookingEntity> {
    this.logger.log(`✅ [BUSINESS RULE] Completing booking - ID: ${id}`);

    const updated = await this.bookingRepository.update(id, {
      status: BookingStatus.COMPLETED,
      completedAt: new Date(),
    });

    this.logger.log(`✅ [BUSINESS RULE] Booking completed - ID: ${id}`);
    return updated!;
  }
}

