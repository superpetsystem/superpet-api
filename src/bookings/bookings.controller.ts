import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
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
import { BookingService } from './services/booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Controller('bookings')
@UseGuards(JwtAuthGuard, FeatureGuard)
@RequireFeature('ONLINE_BOOKING' as any)
export class BookingsController {
  private readonly logger = new Logger(BookingsController.name);

  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createBooking(@CurrentUser() user: any, @Body() dto: CreateBookingDto) {
    this.logger.log(`📅 Create booking - Customer: ${dto.customerId}, Service: ${dto.serviceId}`);

    const booking = await this.bookingService.create(user.organizationId, dto);

    this.logger.log(`✅ Booking created - ID: ${booking.id}`);
    return booking;
  }

  @Get('stores/:storeId')
  @HttpCode(HttpStatus.OK)
  async getStoreBookings(
    @CurrentUser() user: any,
    @Param('storeId') storeId: string,
    @Query('date') date?: string,
  ) {
    this.logger.log(`📋 List bookings - Store: ${storeId}, Date: ${date || 'all'}`);

    const bookings = await this.bookingService.findByStore(storeId, date ? new Date(date) : undefined);

    this.logger.log(`✅ Found ${bookings.length} bookings`);
    return bookings;
  }

  @Get('customers/:customerId')
  @HttpCode(HttpStatus.OK)
  async getCustomerBookings(@CurrentUser() user: any, @Param('customerId') customerId: string) {
    this.logger.log(`📋 List customer bookings - Customer: ${customerId}`);

    const bookings = await this.bookingService.findByCustomer(customerId, user.organizationId);

    this.logger.log(`✅ Found ${bookings.length} bookings`);
    return bookings;
  }

  @Patch(':id/confirm')
  @HttpCode(HttpStatus.OK)
  @Roles(EmployeeRole.OWNER, EmployeeRole.ADMIN, EmployeeRole.STAFF)
  @UseGuards(RoleGuard)
  async confirmBooking(@CurrentUser() user: any, @Param('id') id: string) {
    this.logger.log(`✅ Confirm booking - ID: ${id}`);

    const booking = await this.bookingService.confirm(id);

    this.logger.log(`✅ Booking confirmed - ID: ${id}`);
    return booking;
  }

  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
  async cancelBooking(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    this.logger.log(`❌ Cancel booking - ID: ${id}, Reason: ${reason}`);

    const booking = await this.bookingService.cancel(id, reason);

    this.logger.log(`✅ Booking cancelled - ID: ${id}`);
    return booking;
  }

  @Patch(':id/complete')
  @HttpCode(HttpStatus.OK)
  @Roles(EmployeeRole.OWNER, EmployeeRole.ADMIN, EmployeeRole.STAFF)
  @UseGuards(RoleGuard)
  async completeBooking(@CurrentUser() user: any, @Param('id') id: string) {
    this.logger.log(`✅ Complete booking - ID: ${id}`);

    const booking = await this.bookingService.complete(id);

    this.logger.log(`✅ Booking completed - ID: ${id}`);
    return booking;
  }
}

