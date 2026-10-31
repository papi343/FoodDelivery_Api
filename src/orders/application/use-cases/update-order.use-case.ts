import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Order } from '../../domain/entities/order.entity';
import { OrderItem } from '../../domain/entities/order-item.entity';
import { OrderRepository } from '../../domain/repositories/order.repository';
import { MenuItemRepository } from '../../../menu/domain/repositories/menu-item.repository';

@Injectable()
export class UpdateOrderUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly menuItemRepository: MenuItemRepository,
  ) {}

  async execute(
    id: number,
    clientId: number,
    input: {
      adresseLivraison?: string;
      items?: Array<{ menuItemId: number; quantite: number }>;
    },
  ): Promise<Order> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new NotFoundException(`Commande #${id} introuvable`);
    }

    if (order.clientId !== clientId) {
      throw new ForbiddenException(
        'Vous ne pouvez modifier que vos propres commandes',
      );
    }

    if (!order.canBeModifiedByClient()) {
      throw new BadRequestException(
        `Impossible de modifier la commande une fois en statut ${order.statut}`,
      );
    }

    let orderItems: OrderItem[] | undefined;
    let total: number | undefined;

    if (input.items && input.items.length > 0) {
      const menuItemIds = input.items.map((i) => i.menuItemId);
      const menuItems = await this.menuItemRepository.findByIds(menuItemIds);
      const menuMap = new Map(menuItems.map((m) => [m.id!, m]));

      orderItems = [];
      let sum = 0;

      for (const reqItem of input.items) {
        const menuItem = menuMap.get(reqItem.menuItemId);
        if (!menuItem || menuItem.restaurantId !== order.restaurantId) {
          throw new BadRequestException(
            `Le plat #${reqItem.menuItemId} n'appartient pas au restaurant de la commande`,
          );
        }
        if (!menuItem.disponible) {
          throw new BadRequestException(
            `Le plat "${menuItem.nom}" n'est plus disponible`,
          );
        }
        const oi = new OrderItem(
          null,
          id,
          menuItem.id!,
          reqItem.quantite,
          menuItem.prix,
          menuItem.nom,
        );
        orderItems.push(oi);
        sum += oi.sousTotal;
      }

      total = Number(sum.toFixed(2));
    }

    return this.orderRepository.updateOrderDetails(id, {
      adresseLivraison: input.adresseLivraison,
      items: orderItems,
      total,
    });
  }
}
