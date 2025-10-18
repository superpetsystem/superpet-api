import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { CustomerEntity } from './entities/customer.entity';
import { AddressEntity } from './entities/address.entity';
import { PersonDataEntity } from './entities/person-data.entity';
import { CustomersRepository } from './customers.repository';
import { AddressRepository } from './repositories/address.repository';
import { PersonDataRepository } from './repositories/person-data.repository';
import { CustomerCreateService } from './services/customer-create.service';
import { CustomerGetService } from './services/customer-get.service';
import { CustomerUpdateService } from './services/customer-update.service';
import { CustomerDeleteService } from './services/customer-delete.service';
import { AddressService } from './services/address.service';
import { PersonDataService } from './services/person-data.service';
import { CustomersController } from './customers.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      CustomerEntity,
      AddressEntity,
      PersonDataEntity,
    ]),
    AuthModule,
  ],
  controllers: [CustomersController],
  providers: [
    CustomersRepository,
    AddressRepository,
    PersonDataRepository,
    CustomerCreateService,
    CustomerGetService,
    CustomerUpdateService,
    CustomerDeleteService,
    AddressService,
    PersonDataService,
  ],
  exports: [
    CustomersRepository,
    CustomerCreateService,
    CustomerGetService,
    CustomerUpdateService,
    CustomerDeleteService,
    AddressService,
    PersonDataService,
  ],
})
export class CustomersModule {}

