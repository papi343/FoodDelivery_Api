import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Order } from '../../domain/entities/order.entity';
import { OrderItem } from '../../domain/entities/order-item.entity';
import { OrderRepository } from '../../domain/repositories/order.repository';
import { RestaurantRepository } from '../../../restaurants/domain/repositories/restaurant.repository';
import { MenuItemRepository } from '../../../menu/domain/repositories/menu-item.repository';
import { OrderStatus } from '../../../common/enums/order-status.enum';

// Use case pour créer une nouvelle commande client
@Injectable()
export class CreateOrderUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly restaurantRepository: RestaurantRepository,
    private readonly menuItemRepository: MenuItemRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    clientId: number,
    input: {
      restaurantId: number;
      adresseLivraison: string;
      items: Array<{ menuItemId: number; quantite: number }>;
    },
  ): Promise<Order> {
    // On vérifie que le restaurant existe et qu'il est bien ouvert
    const restaurant = await this.restaurantRepository.findById(
      input.restaurantId,
    );
    if (!restaurant) {
      throw new NotFoundException(
        `Restaurant #${input.restaurantId} introuvable`,
      );
    }

    if (!restaurant.estOuvert) {
      throw new BadRequestException(
        `Le restaurant "${restaurant.nom}" est actuellement fermé`,
      );
    }

    if (!input.items || input.items.length === 0) {
      throw new BadRequestException(
        'Une commande doit contenir au moins un plat',
      );
    }

    // Récupération des plats commandés pour vérifier leur prix et disponibilité
    const menuItemIds = input.items.map((i) => i.menuItemId);
    const menuItems = await this.menuItemRepository.findByIds(menuItemIds);
    const menuMap = new Map(menuItems.map((m) => [m.id!, m]));

    const orderItems: OrderItem[] = [];
    let total = 0;

    for (const reqItem of input.items) {
      const menuItem = menuMap.get(reqItem.menuItemId);
      if (!menuItem || menuItem.restaurantId !== input.restaurantId) {
        throw new BadRequestException(
          `Le plat #${reqItem.menuItemId} n'appartient pas à ce restaurant`,
        );
      }
      if (!menuItem.disponible) {
        throw new BadRequestException(
          `Le plat "${menuItem.nom}" n'est plus disponible`,
        );
      }
      const orderItem = new OrderItem(
        null,
        null,
        menuItem.id!,
        reqItem.quantite,
        menuItem.prix,
        menuItem.nom,
      );
      orderItems.push(orderItem);
      total += orderItem.sousTotal;
    }

    // Création de l'entité Order avec le statut initial EN_ATTENTE
    const order = new Order(
      null,
      clientId,
      input.restaurantId,
      orderItems,
      OrderStatus.EN_ATTENTE,
      Number(total.toFixed(2)),
      input.adresseLivraison,
    );

    const createdOrder = await this.orderRepository.create(order);

    // Envoi de l'événement temps réel au restaurateur
    this.eventEmitter.emit('restaurant.newOrder', {
      order: createdOrder,
      restaurantOwnerId: restaurant.ownerId,
    });

    return createdOrder;
  }
}
