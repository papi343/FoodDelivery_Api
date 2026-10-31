import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Payment } from '../../domain/entities/payment.entity';
import { PaymentRepository } from '../../domain/repositories/payment.repository';
import { OrderRepository } from '../../../orders/domain/repositories/order.repository';
import { Role } from '../../../common/enums/role.enum';

@Injectable()
export class GetPaymentByOrderUseCase {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly orderRepository: OrderRepository,
  ) {}

  async execute(
    orderId: number,
    requester: { id: number; role: Role },
  ): Promise<Payment> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException(`Commande #${orderId} introuvable`);
    }

    if (requester.role === Role.CLIENT && order.clientId !== requester.id) {
      throw new ForbiddenException(
        'Vous ne pouvez consulter que les paiements de vos propres commandes',
      );
    }

    const payment = await this.paymentRepository.findByOrderId(orderId);
    if (!payment) {
      throw new NotFoundException(
        `Aucun paiement trouvé pour la commande #${orderId}`,
      );
    }

    return payment;
  }
}
