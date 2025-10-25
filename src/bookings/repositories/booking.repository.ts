import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { BookingEntity, BookingStatus } from '../entities/booking.entity';

@Injectable()
export class BookingRepository {
  constructor(
    @InjectRepository(BookingEntity)
    private readonly repository: Repository<BookingEntity>,
  ) {}

  async create(data: Partial<BookingEntity>): Promise<BookingEntity> {
    const booking = this.repository.create(data);
    return this.repository.save(booking);
  }

  async findById(id: string): Promise<BookingEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['customer', 'pet', 'service', 'employee', 'store'],
    });
  }

  async findByStore(storeId: string, date?: Date): Promise<BookingEntity[]> {
    const query = this.repository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.customer', 'customer')
      .leftJoinAndSelect('booking.pet', 'pet')
      .leftJoinAndSelect('booking.service', 'service')
      .leftJoinAndSelect('booking.employee', 'employee')
      .where('booking.storeId = :storeId', { storeId });

    if (date) {
      query.andWhere('booking.bookingDate = :date', { date });
    }

    return query.orderBy('booking.bookingDate', 'ASC').addOrderBy('booking.startTime', 'ASC').getMany();
  }

  async findByCustomer(customerId: string, organizationId: string): Promise<BookingEntity[]> {
    return this.repository.find({
      where: { customerId, organizationId },
      relations: ['store', 'service', 'pet', 'employee'],
      order: { bookingDate: 'DESC', startTime: 'DESC' },
    });
  }

  async update(id: string, data: Partial<BookingEntity>): Promise<BookingEntity | null> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async checkAvailability(storeId: string, date: Date, startTime: string, endTime: string, employeeId?: string): Promise<boolean> {
    const query = this.repository
      .createQueryBuilder('booking')
      .where('booking.storeId = :storeId', { storeId })
      .andWhere('booking.bookingDate = :date', { date })
      .andWhere('booking.status NOT IN (:...statuses)', { statuses: [BookingStatus.CANCELLED, BookingStatus.NO_SHOW] })
      .andWhere('(booking.startTime < :endTime AND booking.endTime > :startTime)', { startTime, endTime });

    if (employeeId) {
      query.andWhere('booking.employeeId = :employeeId', { employeeId });
    }

    const conflicting = await query.getCount();
    return conflicting === 0;
  }
}

