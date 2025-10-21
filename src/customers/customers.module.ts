import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerEntity } from './entities/customer.entity';
import { AddressEntity } from './entities/address.entity';
import { PersonDataEntity } from './entities/person-data.entity';
import { CustomersRepository } from './repositories/customers.repository';
import { AddressRepository } from './repositories/address.repository';
import { PersonDataRepository } from './repositories/person-data.repository';
import { CustomerService } from './services/customer.service';
import { AddressService } from './services/address.service';
import { PersonDataService } from './services/person-data.service';
import { CustomersController } from './customers.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CustomerEntity, AddressEntity, PersonDataEntity]),
    AuthModule,
  ],
  controllers: [CustomersController],
  providers: [
    CustomersRepository,
    AddressRepository,
    PersonDataRepository,
    CustomerService,
    AddressService,
    PersonDataService,
  ],
  exports: [
    CustomersRepository,
    CustomerService,
    AddressService,
    PersonDataService,
  ],
})
export class CustomersModule {}
