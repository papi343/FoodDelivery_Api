import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Order } from '../../domain/entities/order.entity';
import { OrderRepository } from '../../domain/repositories/order.repository';
import { RestaurantRepository } from '../../../restaurants/domain/repositories/restaurant.repository';
import { OrderStatus } from '../../../common/enums/order-status.enum';
import { Role } from '../../../common/enums/role.enum';

@Injectable()
export class CancelOrderUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly restaurantRepository: RestaurantRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    id: number,
    requester: { id: number; role: Role },
  ): Promise<Order> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new NotFoundException(`Commande #${id} introuvable`);
    }

    if (requester.role === Role.CLIENT && order.clientId !== requester.id) {
      throw new ForbiddenException(
        'Vous ne pouvez annuler que vos propres commandes',
      );
    }

    if (requester.role === Role.RESTAURANT) {
      const restaurant = await this.restaurantRepository.findById(
        order.restaurantId,
      );
      if (restaurant?.ownerId !== requester.id) {
        throw new ForbiddenException(
          'Vous ne pouvez annuler que les commandes de votre restaurant',
        );
      }
    }

    if (!order.canBeCancelled()) {
      throw new BadRequestException(
        `Impossible d'annuler une commande en statut ${order.statut}`,
      );
    }

    const cancelled = await this.orderRepository.updateStatus(
      id,
      OrderStatus.ANNULEE,
    );

    this.eventEmitter.emit('order.statusChanged', {
      order: cancelled,
    });

    return cancelled;
  }
}
