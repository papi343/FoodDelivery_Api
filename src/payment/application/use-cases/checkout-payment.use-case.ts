import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Payment } from '../../domain/entities/payment.entity';
import { PaymentRepository } from '../../domain/repositories/payment.repository';
import { OrderRepository } from '../../../orders/domain/repositories/order.repository';
import { PaymentStatus } from '../../../common/enums/payment-status.enum';
import { OrderStatus } from '../../../common/enums/order-status.enum';

@Injectable()
export class CheckoutPaymentUseCase {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly orderRepository: OrderRepository,
  ) {}

  async execute(
    clientId: number,
    input: {
      orderId: number;
      methode: string;
      simulerEchec?: boolean;
    },
  ): Promise<Payment> {
    const order = await this.orderRepository.findById(input.orderId);
    if (!order) {
      throw new NotFoundException(`Commande #${input.orderId} introuvable`);
    }

    if (order.clientId !== clientId) {
      throw new ForbiddenException(
        'Vous ne pouvez payer que vos propres commandes',
      );
    }

    if (order.statut === OrderStatus.ANNULEE) {
      throw new BadRequestException('Impossible de payer une commande annulée');
    }

    const existingPayment = await this.paymentRepository.findByOrderId(
      input.orderId,
    );
    if (existingPayment && existingPayment.statut === PaymentStatus.PAYE) {
      throw new ConflictException(
        `La commande #${input.orderId} a déjà été payée`,
      );
    }

    const transactionId = `TXN-${randomUUID().slice(0, 12).toUpperCase()}`;
    const statut = input.simulerEchec
      ? PaymentStatus.ECHOUE
      : PaymentStatus.PAYE;

    const payment = new Payment(
      null,
      input.orderId,
      order.total,
      statut,
      input.methode,
      transactionId,
    );

    return this.paymentRepository.create(payment);
  }
}
