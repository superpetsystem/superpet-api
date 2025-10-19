import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LiveCamStreamEntity } from './entities/live-cam-stream.entity';
import { LiveCamRepository } from './repositories/live-cam.repository';
import { LiveCamService } from './services/live-cam.service';
import { LiveCamController } from './live-cam.controller';
import { StoresModule } from '../stores/stores.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LiveCamStreamEntity]),
    StoresModule,
    AuthModule,
  ],
  controllers: [LiveCamController],
  providers: [LiveCamRepository, LiveCamService],
  exports: [LiveCamRepository, LiveCamService],
})
export class LiveCamModule {}


