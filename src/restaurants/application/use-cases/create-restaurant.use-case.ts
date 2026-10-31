import { Injectable } from '@nestjs/common';
import { Restaurant } from '../../domain/entities/restaurant.entity';
import { RestaurantRepository } from '../../domain/repositories/restaurant.repository';

@Injectable()
export class CreateRestaurantUseCase {
  constructor(private readonly restaurantRepository: RestaurantRepository) {}

  async execute(input: {
    nom: string;
    adresse: string;
    ownerId: number;
    estOuvert?: boolean;
    horaires?: string;
    note?: number;
  }): Promise<Restaurant> {
    const restaurant = new Restaurant(
      null,
      input.nom,
      input.adresse,
      input.ownerId,
      input.estOuvert ?? true,
      input.horaires ?? null,
      input.note ?? 0,
    );
    return this.restaurantRepository.create(restaurant);
  }
}
