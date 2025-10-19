import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PickupEntity } from './entities/pickup.entity';
import { PickupsRepository } from './repositories/pickups.repository';
import { PickupService } from './services/pickup.service';
import { PickupsController } from './pickups.controller';
import { StoresModule } from '../stores/stores.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PickupEntity]),
    StoresModule,
    AuthModule,
  ],
  controllers: [PickupsController],
  providers: [PickupsRepository, PickupService],
  exports: [PickupsRepository, PickupService],
})
export class PickupsModule {}


