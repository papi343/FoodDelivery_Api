import { Injectable } from '@nestjs/common';
import { Delivery } from '../../domain/entities/delivery.entity';
import { DeliveryRepository } from '../../domain/repositories/delivery.repository';

@Injectable()
export class FindMyDeliveriesUseCase {
  constructor(private readonly deliveryRepository: DeliveryRepository) {}

  async execute(livreurId: number): Promise<Delivery[]> {
    return this.deliveryRepository.findByLivreurId(livreurId);
  }
}
