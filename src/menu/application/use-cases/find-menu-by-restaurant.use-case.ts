import { Injectable, NotFoundException } from '@nestjs/common';
import { MenuItem } from '../../domain/entities/menu-item.entity';
import { MenuItemRepository } from '../../domain/repositories/menu-item.repository';
import { RestaurantRepository } from '../../../restaurants/domain/repositories/restaurant.repository';

@Injectable()
export class FindMenuByRestaurantUseCase {
  constructor(
    private readonly menuItemRepository: MenuItemRepository,
    private readonly restaurantRepository: RestaurantRepository,
  ) {}

  async execute(restaurantId: number): Promise<MenuItem[]> {
    const restaurant = await this.restaurantRepository.findById(restaurantId);
    if (!restaurant) {
      throw new NotFoundException(`Restaurant #${restaurantId} introuvable`);
    }
    return this.menuItemRepository.findByRestaurantId(restaurantId);
  }
}
