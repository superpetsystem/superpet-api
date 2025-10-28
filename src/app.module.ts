import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { UsersModule } from './users/users.module';
import { EmployeesModule } from './employees/employees.module';
import { CustomersModule } from './customers/customers.module';
import { PetsModule } from './pets/pets.module';
import { StoresModule } from './stores/stores.module';
import { ServicesModule } from './services/services.module';
import { PickupsModule } from './pickups/pickups.module';
import { LiveCamModule } from './live-cam/live-cam.module';
import { InventoryModule } from './inventory/inventory.module';
import { ReportsModule } from './reports/reports.module';
import { BookingsModule } from './bookings/bookings.module';
import { VeterinaryModule } from './veterinary/veterinary.module';
import { AdminModule } from './admin/admin.module';
import { PdvModule } from './pdv/pdv.module';
import { CustomerPortalModule } from './customer-portal/customer-portal.module';
import { FiscalModule } from './fiscal/fiscal.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: (() => {
        const env = process.env.NODE_ENV || 'local';
        const envMap = {
          local: 'env/local.env',
          staging: 'env/staging.env',
          production: 'env/prod.env',
        };
        return envMap[env] || 'env/local.env';
      })(),
    }),
    DatabaseModule,
    AuthModule,
    OrganizationsModule,
    UsersModule,
    EmployeesModule,
    CustomersModule,
    PetsModule,
    StoresModule,
    ServicesModule,
    PickupsModule,
    LiveCamModule,
    InventoryModule,
    ReportsModule,
    BookingsModule,
    VeterinaryModule,
    AdminModule,
    PdvModule,
    CustomerPortalModule,
    FiscalModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
