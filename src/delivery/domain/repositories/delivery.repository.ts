import { Delivery } from '../entities/delivery.entity';
import { DeliveryStatus } from '../../../common/enums/delivery-status.enum';

export abstract class DeliveryRepository {
  abstract create(delivery: Delivery): Promise<Delivery>;
  abstract findById(id: number): Promise<Delivery | null>;
  abstract findByOrderId(orderId: number): Promise<Delivery | null>;
  abstract findByLivreurId(livreurId: number): Promise<Delivery[]>;
  abstract updateStatusAndLocation(
    id: number,
    data: {
      statut?: DeliveryStatus;
      positionActuelle?: string;
      heureEstimee?: Date;
    },
  ): Promise<Delivery>;
}
