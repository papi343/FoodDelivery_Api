import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Delivery } from '../../domain/entities/delivery.entity';
import { DeliveryRepository } from '../../domain/repositories/delivery.repository';
import { OrderRepository } from '../../../orders/domain/repositories/order.repository';
import { DeliveryStatus } from '../../../common/enums/delivery-status.enum';
import { OrderStatus } from '../../../common/enums/order-status.enum';
import { Role } from '../../../common/enums/role.enum';

@Injectable()
export class UpdateDeliveryStatusUseCase {
  constructor(
    private readonly deliveryRepository: DeliveryRepository,
    private readonly orderRepository: OrderRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    id: number,
    requester: { id: number; role: Role },
    input: {
      statut?: DeliveryStatus;
      positionActuelle?: string;
      heureEstimee?: string;
    },
  ): Promise<Delivery> {
    const delivery = await this.deliveryRepository.findById(id);
    if (!delivery) {
      throw new NotFoundException(`Livraison #${id} introuvable`);
    }

    if (
      requester.role !== Role.ADMIN &&
      delivery.livreurId !== requester.id
    ) {
      throw new ForbiddenException(
        'Vous ne pouvez mettre à jour que vos propres livraisons',
      );
    }

    const updatedDelivery =
      await this.deliveryRepository.updateStatusAndLocation(id, {
        statut: input.statut,
        positionActuelle: input.positionActuelle,
        heureEstimee: input.heureEstimee
          ? new Date(input.heureEstimee)
          : undefined,
      });

    const order = await this.orderRepository.findById(delivery.orderId);

    if (input.positionActuelle && order) {
      this.eventEmitter.emit('delivery.locationUpdate', {
        delivery: updatedDelivery,
        clientId: order.clientId,
      });
    }

    if (input.statut === DeliveryStatus.LIVREE && order) {
      const deliveredOrder = await this.orderRepository.updateStatus(
        order.id!,
        OrderStatus.LIVREE,
      );
      this.eventEmitter.emit('order.statusChanged', {
        order: deliveredOrder,
      });
    }

    return updatedDelivery;
  }
}
