import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreEntity } from './entities/store.entity';
import { StoreFeatureEntity } from './entities/store-feature.entity';
import { FeatureEntity } from './entities/feature.entity';
import { StoresRepository } from './repositories/stores.repository';
import { StoreFeatureRepository } from './repositories/store-feature.repository';
import { StoreService } from './services/store.service';
import { StoreFeatureService } from './services/store-feature.service';
import { StoresController } from './stores.controller';
import { AuthModule } from '../auth/auth.module';
import { OrganizationsModule } from '../organizations/organizations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StoreEntity, StoreFeatureEntity, FeatureEntity]),
    AuthModule,
    OrganizationsModule,
  ],
  controllers: [StoresController],
  providers: [
    StoresRepository,
    StoreFeatureRepository,
    StoreService,
    StoreFeatureService,
  ],
  exports: [
    StoresRepository,
    StoreFeatureRepository,
    StoreService,
    StoreFeatureService,
  ],
})
export class StoresModule {}
