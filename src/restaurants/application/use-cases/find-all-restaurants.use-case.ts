import { Injectable } from '@nestjs/common';
import { Restaurant } from '../../domain/entities/restaurant.entity';
import { RestaurantRepository } from '../../domain/repositories/restaurant.repository';

@Injectable()
export class FindAllRestaurantsUseCase {
  constructor(private readonly restaurantRepository: RestaurantRepository) {}

  async execute(): Promise<Restaurant[]> {
    return this.restaurantRepository.findAll();
  }
}
