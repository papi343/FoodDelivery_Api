import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { OrdersModule } from '../orders/orders.module';
import { UsersModule } from '../users/users.module';
import { DeliveryRepository } from './domain/repositories/delivery.repository';
import { PrismaDeliveryRepository } from './infrastructure/repositories/prisma-delivery.repository';
import { AssignDeliveryUseCase } from './application/use-cases/assign-delivery.use-case';
import { UpdateDeliveryStatusUseCase } from './application/use-cases/update-delivery-status.use-case';
import { FindDeliveryByIdUseCase } from './application/use-cases/find-delivery-by-id.use-case';
import { FindMyDeliveriesUseCase } from './application/use-cases/find-my-deliveries.use-case';
import { DeliveryController } from './presentation/http/delivery.controller';

@Module({
  imports: [PrismaModule, OrdersModule, UsersModule],
  controllers: [DeliveryController],
  providers: [
    AssignDeliveryUseCase,
    UpdateDeliveryStatusUseCase,
    FindDeliveryByIdUseCase,
    FindMyDeliveriesUseCase,
    PrismaDeliveryRepository,
    {
      provide: DeliveryRepository,
      useExisting: PrismaDeliveryRepository,
    },
  ],
  exports: [DeliveryRepository],
})
export class DeliveryModule {}
