import { DeliveryStatus } from '../../../common/enums/delivery-status.enum';

export class Delivery {
  constructor(
    public readonly id: number | null,
    public readonly orderId: number,
    public readonly livreurId: number,
    public statut: DeliveryStatus = DeliveryStatus.ASSIGNEE,
    public positionActuelle: string | null = null,
    public heureEstimee: Date | null = null,
    public readonly createdAt?: Date,
  ) {}
}
