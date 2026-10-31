import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { OrdersModule } from '../orders/orders.module';
import { PaymentRepository } from './domain/repositories/payment.repository';
import { PrismaPaymentRepository } from './infrastructure/repositories/prisma-payment.repository';
import { CheckoutPaymentUseCase } from './application/use-cases/checkout-payment.use-case';
import { GetPaymentByOrderUseCase } from './application/use-cases/get-payment-by-order.use-case';
import { PaymentController } from './presentation/http/payment.controller';

@Module({
  imports: [PrismaModule, OrdersModule],
  controllers: [PaymentController],
  providers: [
    CheckoutPaymentUseCase,
    GetPaymentByOrderUseCase,
    PrismaPaymentRepository,
    {
      provide: PaymentRepository,
      useExisting: PrismaPaymentRepository,
    },
  ],
  exports: [PaymentRepository],
})
export class PaymentModule {}
