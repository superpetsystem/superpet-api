import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './entities/product.entity';
import { InventoryStockEntity } from './entities/inventory-stock.entity';
import { InventoryMovementEntity } from './entities/inventory-movement.entity';
import { ProductsRepository } from './repositories/products.repository';
import { InventoryStockRepository } from './repositories/inventory-stock.repository';
import { InventoryMovementRepository } from './repositories/inventory-movement.repository';
import { ProductService } from './services/product.service';
import { InventoryService } from './services/inventory.service';
import { InventoryController } from './inventory.controller';
import { OrganizationsModule } from '../organizations/organizations.module';
import { AuthModule } from '../auth/auth.module';
import { EmployeesModule } from '../employees/employees.module';
import { StoresModule } from '../stores/stores.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductEntity,
      InventoryStockEntity,
      InventoryMovementEntity,
    ]),
    OrganizationsModule,
    AuthModule,
    EmployeesModule,
    StoresModule,
  ],
  controllers: [InventoryController],
  providers: [
    ProductsRepository,
    InventoryStockRepository,
    InventoryMovementRepository,
    ProductService,
    InventoryService,
  ],
  exports: [
    ProductService,
    InventoryService,
    ProductsRepository,
  ],
})
export class InventoryModule {}

