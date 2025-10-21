import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingEntity } from './entities/booking.entity';
import { BookingRepository } from './repositories/booking.repository';
import { BookingService } from './services/booking.service';
import { BookingsController } from './bookings.controller';
import { AuthModule } from '../auth/auth.module';
import { EmployeesModule } from '../employees/employees.module';
import { StoresModule } from '../stores/stores.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BookingEntity]),
    AuthModule,
    EmployeesModule,
    StoresModule,
  ],
  controllers: [BookingsController],
  providers: [BookingRepository, BookingService],
  exports: [BookingService],
})
export class BookingsModule {}

