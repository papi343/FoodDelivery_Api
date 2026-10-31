import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { RestaurantsModule } from '../restaurants/restaurants.module';
import { OrdersModule } from '../orders/orders.module';
import { GetDashboardStatsUseCase } from './application/use-cases/get-dashboard-stats.use-case';
import { ManageUsersUseCase } from './application/use-cases/manage-users.use-case';
import { GetAllOrdersAdminUseCase } from './application/use-cases/get-all-orders-admin.use-case';
import { AdminController } from './presentation/http/admin.controller';

@Module({
  imports: [UsersModule, RestaurantsModule, OrdersModule],
  controllers: [AdminController],
  providers: [
    GetDashboardStatsUseCase,
    ManageUsersUseCase,
    GetAllOrdersAdminUseCase,
  ],
})
export class AdminModule {}
