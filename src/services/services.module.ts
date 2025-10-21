import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceEntity } from './entities/service.entity';
import { CustomServiceEntity } from './entities/custom-service.entity';
import { ServicesRepository } from './repositories/services.repository';
import { CustomServiceRepository } from './repositories/custom-service.repository';
import { ServiceService } from './services/service.service';
import { CustomServiceService } from './services/custom-service.service';
import { ServicesController } from './services.controller';
import { CustomServicesController } from './controllers/custom-services.controller';
import { StoresModule } from '../stores/stores.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ServiceEntity, CustomServiceEntity]),
    StoresModule,
    AuthModule,
  ],
  controllers: [ServicesController, CustomServicesController],
  providers: [
    ServicesRepository,
    CustomServiceRepository,
    ServiceService,
    CustomServiceService,
  ],
  exports: [
    ServicesRepository,
    CustomServiceRepository,
    ServiceService,
    CustomServiceService,
  ],
})
export class ServicesModule {}
