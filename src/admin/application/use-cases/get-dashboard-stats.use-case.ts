import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { RestaurantRepository } from '../../../restaurants/domain/repositories/restaurant.repository';
import { OrderRepository } from '../../../orders/domain/repositories/order.repository';
import { DashboardStats } from '../../domain/entities/dashboard-stats.entity';
import { OrderStatus } from '../../../common/enums/order-status.enum';

@Injectable()
export class GetDashboardStatsUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly restaurantRepository: RestaurantRepository,
    private readonly orderRepository: OrderRepository,
  ) {}

  async execute(): Promise<DashboardStats> {
    const [users, restaurants, orders] = await Promise.all([
      this.userRepository.findAll(),
      this.restaurantRepository.findAll(),
      this.orderRepository.findAll(),
    ]);

    const ordersByStatus: Record<string, number> = {};
    let chiffreAffairesTotal = 0;

    for (const order of orders) {
      ordersByStatus[order.statut] = (ordersByStatus[order.statut] ?? 0) + 1;
      if (order.statut !== OrderStatus.ANNULEE) {
        chiffreAffairesTotal += order.total;
      }
    }

    const usersByRole: Record<string, number> = {};
    for (const user of users) {
      usersByRole[user.role] = (usersByRole[user.role] ?? 0) + 1;
    }

    return new DashboardStats(
      users.length,
      restaurants.length,
      orders.length,
      Number(chiffreAffairesTotal.toFixed(2)),
      ordersByStatus,
      usersByRole,
    );
  }
}
