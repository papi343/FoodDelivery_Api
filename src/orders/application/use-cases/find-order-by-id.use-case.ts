import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Order } from '../../domain/entities/order.entity';
import { OrderRepository } from '../../domain/repositories/order.repository';
import { RestaurantRepository } from '../../../restaurants/domain/repositories/restaurant.repository';
import { Role } from '../../../common/enums/role.enum';

@Injectable()
export class FindOrderByIdUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly restaurantRepository: RestaurantRepository,
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
      throw new ForbiddenException('Vous ne pouvez consulter que vos commandes');
    }

    if (requester.role === Role.RESTAURANT) {
      const restaurant = await this.restaurantRepository.findById(
        order.restaurantId,
      );
      if (restaurant?.ownerId !== requester.id) {
        throw new ForbiddenException(
          'Cette commande ne concerne pas votre restaurant',
        );
      }
    }

    return order;
  }
}
