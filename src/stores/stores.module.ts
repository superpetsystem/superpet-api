import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreEntity } from './entities/store.entity';
import { StoreFeatureEntity } from './entities/store-feature.entity';
import { FeatureEntity } from './entities/feature.entity';
import { StoreFeatureAccessEntity } from './entities/feature-access.entity';
import { StoresRepository } from './repositories/stores.repository';
import { StoreFeatureRepository } from './repositories/store-feature.repository';
import { FeatureAccessRepository } from './repositories/feature-access.repository';
import { StoreService } from './services/store.service';
import { StoreFeatureService } from './services/store-feature.service';
import { FeatureAccessService } from './services/feature-access.service';
import { FeatureService } from './services/feature.service';
import { StoreConfigurationService } from './services/store-configuration.service';
import { StoresController } from './stores.controller';
import { FeatureAccessController } from './controllers/feature-access.controller';
import { AuthModule } from '../auth/auth.module';
import { OrganizationsModule } from '../organizations/organizations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StoreEntity, 
      StoreFeatureEntity, 
      FeatureEntity,
      StoreFeatureAccessEntity,
    ]),
    AuthModule,
    OrganizationsModule,
  ],
  controllers: [
    StoresController,
    FeatureAccessController,
  ],
  providers: [
    StoresRepository,
    StoreFeatureRepository,
    FeatureAccessRepository,
    StoreService,
    StoreFeatureService,
    FeatureAccessService,
    FeatureService,
    StoreConfigurationService,
  ],
  exports: [
    StoresRepository,
    StoreFeatureRepository,
    FeatureAccessRepository,
    StoreService,
    StoreFeatureService,
    FeatureAccessService,
    FeatureService,
    StoreConfigurationService,
  ],
})
export class StoresModule {}
