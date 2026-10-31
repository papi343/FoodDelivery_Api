import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RestaurantsModule } from '../restaurants/restaurants.module';
import { MenuModule } from '../menu/menu.module';
import { OrderRepository } from './domain/repositories/order.repository';
import { PrismaOrderRepository } from './infrastructure/repositories/prisma-order.repository';
import { CreateOrderUseCase } from './application/use-cases/create-order.use-case';
import { FindOrderByIdUseCase } from './application/use-cases/find-order-by-id.use-case';
import { FindMyOrdersUseCase } from './application/use-cases/find-my-orders.use-case';
import { UpdateOrderUseCase } from './application/use-cases/update-order.use-case';
import { CancelOrderUseCase } from './application/use-cases/cancel-order.use-case';
import { UpdateOrderStatusUseCase } from './application/use-cases/update-order-status.use-case';
import { OrdersController } from './presentation/http/orders.controller';

@Module({
  imports: [PrismaModule, RestaurantsModule, MenuModule],
  controllers: [OrdersController],
  providers: [
    CreateOrderUseCase,
    FindOrderByIdUseCase,
    FindMyOrdersUseCase,
    UpdateOrderUseCase,
    CancelOrderUseCase,
    UpdateOrderStatusUseCase,
    PrismaOrderRepository,
    {
      provide: OrderRepository,
      useExisting: PrismaOrderRepository,
    },
  ],
  exports: [OrderRepository],
})
export class OrdersModule {}
