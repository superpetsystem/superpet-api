import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerPortalController } from './customer-portal.controller';
import { StoresModule } from '../stores/stores.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([]),
    StoresModule,
    AuthModule,
  ],
  controllers: [CustomerPortalController],
  providers: [],
  exports: [],
})
export class CustomerPortalModule {}
