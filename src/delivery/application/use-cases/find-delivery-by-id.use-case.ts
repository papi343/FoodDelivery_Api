import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Delivery } from '../../domain/entities/delivery.entity';
import { DeliveryRepository } from '../../domain/repositories/delivery.repository';
import { OrderRepository } from '../../../orders/domain/repositories/order.repository';
import { Role } from '../../../common/enums/role.enum';

@Injectable()
export class FindDeliveryByIdUseCase {
  constructor(
    private readonly deliveryRepository: DeliveryRepository,
    private readonly orderRepository: OrderRepository,
  ) {}

  async execute(
    id: number,
    requester: { id: number; role: Role },
  ): Promise<Delivery> {
    const delivery = await this.deliveryRepository.findById(id);
    if (!delivery) {
      throw new NotFoundException(`Livraison #${id} introuvable`);
    }

    if (requester.role === Role.CLIENT) {
      const order = await this.orderRepository.findById(delivery.orderId);
      if (order?.clientId !== requester.id) {
        throw new ForbiddenException(
          'Vous ne pouvez suivre que la livraison de vos propres commandes',
        );
      }
    }

    if (
      requester.role === Role.LIVREUR &&
      delivery.livreurId !== requester.id
    ) {
      throw new ForbiddenException(
        'Vous ne pouvez consulter que vos livraisons assignées',
      );
    }

    return delivery;
  }
}
