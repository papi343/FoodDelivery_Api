import { Injectable, NotFoundException } from '@nestjs/common';
import { Restaurant } from '../../domain/entities/restaurant.entity';
import { RestaurantRepository } from '../../domain/repositories/restaurant.repository';

@Injectable()
export class FindRestaurantByIdUseCase {
  constructor(private readonly restaurantRepository: RestaurantRepository) {}

  async execute(id: number): Promise<Restaurant> {
    const restaurant = await this.restaurantRepository.findById(id);
    if (!restaurant) {
      throw new NotFoundException(`Restaurant #${id} introuvable`);
    }
    return restaurant;
  }
}
