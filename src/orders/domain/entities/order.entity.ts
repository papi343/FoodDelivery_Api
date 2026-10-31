import { OrderStatus } from '../../../common/enums/order-status.enum';
import { OrderItem } from './order-item.entity';

export class Order {
  constructor(
    public readonly id: number | null,
    public readonly clientId: number,
    public readonly restaurantId: number,
    public items: OrderItem[],
    public statut: OrderStatus = OrderStatus.EN_ATTENTE,
    public total: number,
    public adresseLivraison: string,
    public readonly createdAt?: Date,
  ) {}

  canBeModifiedByClient(): boolean {
    return (
      this.statut === OrderStatus.EN_ATTENTE ||
      this.statut === OrderStatus.CONFIRMEE
    );
  }

  canBeCancelled(): boolean {
    return (
      this.statut !== OrderStatus.LIVREE &&
      this.statut !== OrderStatus.ANNULEE
    );
  }
}
