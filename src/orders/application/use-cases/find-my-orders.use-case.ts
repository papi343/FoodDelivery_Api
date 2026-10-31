import { Injectable } from '@nestjs/common';
import { Order } from '../../domain/entities/order.entity';
import { OrderRepository } from '../../domain/repositories/order.repository';

@Injectable()
export class FindMyOrdersUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(clientId: number): Promise<Order[]> {
    return this.orderRepository.findByClientId(clientId);
  }
}
