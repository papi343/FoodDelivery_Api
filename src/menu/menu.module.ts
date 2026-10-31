import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RestaurantsModule } from '../restaurants/restaurants.module';
import { MenuItemRepository } from './domain/repositories/menu-item.repository';
import { PrismaMenuItemRepository } from './infrastructure/repositories/prisma-menu-item.repository';
import { CreateMenuItemUseCase } from './application/use-cases/create-menu-item.use-case';
import { FindMenuByRestaurantUseCase } from './application/use-cases/find-menu-by-restaurant.use-case';
import { UpdateMenuItemUseCase } from './application/use-cases/update-menu-item.use-case';
import { DeleteMenuItemUseCase } from './application/use-cases/delete-menu-item.use-case';
import { MenuController } from './presentation/http/menu.controller';

@Module({
  imports: [PrismaModule, RestaurantsModule],
  controllers: [MenuController],
  providers: [
    CreateMenuItemUseCase,
    FindMenuByRestaurantUseCase,
    UpdateMenuItemUseCase,
    DeleteMenuItemUseCase,
    PrismaMenuItemRepository,
    {
      provide: MenuItemRepository,
      useExisting: PrismaMenuItemRepository,
    },
  ],
  exports: [MenuItemRepository],
})
export class MenuModule {}
