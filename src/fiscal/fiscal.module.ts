import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FiscalController } from './fiscal.controller';
import { FiscalService } from './services/fiscal.service';
import { InvoiceRepository } from './repositories/invoice.repository';
import { InvoiceEntity } from './entities/invoice.entity';
import { AuthModule } from '../auth/auth.module';
import { StoresModule } from '../stores/stores.module';
import { EmployeesModule } from '../employees/employees.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([InvoiceEntity]),
    AuthModule,
    StoresModule,
    EmployeesModule,
  ],
  controllers: [FiscalController],
  providers: [FiscalService, InvoiceRepository],
  exports: [FiscalService],
})
export class FiscalModule {}


