import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { OrderStatus } from '../../../common/enums/order-status.enum';

export abstract class OrderRepository {
  abstract create(order: Order): Promise<Order>;
  abstract findById(id: number): Promise<Order | null>;
  abstract findByClientId(clientId: number): Promise<Order[]>;
  abstract findByRestaurantId(restaurantId: number): Promise<Order[]>;
  abstract findAll(): Promise<Order[]>;
  abstract updateOrderDetails(
    id: number,
    data: {
      adresseLivraison?: string;
      items?: OrderItem[];
      total?: number;
    },
  ): Promise<Order>;
  abstract updateStatus(id: number, statut: OrderStatus): Promise<Order>;
}
