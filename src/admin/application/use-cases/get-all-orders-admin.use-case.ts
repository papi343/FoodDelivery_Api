import { Injectable } from '@nestjs/common';
import { OrderRepository } from '../../../orders/domain/repositories/order.repository';
import { Order } from '../../../orders/domain/entities/order.entity';

@Injectable()
export class GetAllOrdersAdminUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(): Promise<Order[]> {
    return this.orderRepository.findAll();
  }
}
