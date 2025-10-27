import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { PdvController } from './pdv.controller';
import { CartService } from './services/cart.service';
import { CartRepository } from './repositories/cart.repository';
import { CartItemRepository } from './repositories/cart-item.repository';
import { TransactionRepository } from './repositories/transaction.repository';
import { ReceiptRepository } from './repositories/receipt.repository';
import { CartEntity } from './entities/cart.entity';
import { CartItemEntity } from './entities/cart-item.entity';
import { TransactionEntity } from './entities/transaction.entity';
import { ReceiptEntity } from './entities/receipt.entity';
import { StoresModule } from '../stores/stores.module';
import { CustomersModule } from '../customers/customers.module';
import { InventoryModule } from '../inventory/inventory.module';
import { ServicesModule } from '../services/services.module';
import { EmployeesModule } from '../employees/employees.module';
import { StoreAccessGuard } from '../common/guards/store-access.guard';
import { PdvFeatureGuard } from './guards/pdv-feature.guard';

@Module({
  imports: [
    AuthModule,
    StoresModule,
    CustomersModule,
    InventoryModule,
    ServicesModule,
    EmployeesModule,
    TypeOrmModule.forFeature([
      CartEntity,
      CartItemEntity,
      TransactionEntity,
      ReceiptEntity,
    ]),
  ],
  controllers: [PdvController],
  providers: [
    CartService,
    CartRepository,
    CartItemRepository,
    TransactionRepository,
    ReceiptRepository,
    StoreAccessGuard,
    PdvFeatureGuard,
  ],
  exports: [
    CartService,
    CartRepository,
    CartItemRepository,
    TransactionRepository,
    ReceiptRepository,
  ],
})
export class PdvModule {}
