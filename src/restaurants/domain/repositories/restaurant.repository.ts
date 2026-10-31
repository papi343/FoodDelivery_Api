import { Restaurant } from '../entities/restaurant.entity';

export abstract class RestaurantRepository {
  abstract create(restaurant: Restaurant): Promise<Restaurant>;
  abstract findAll(): Promise<Restaurant[]>;
  abstract findById(id: number): Promise<Restaurant | null>;
  abstract findByOwnerId(ownerId: number): Promise<Restaurant[]>;
  abstract update(
    id: number,
    data: Partial<
      Pick<Restaurant, 'nom' | 'adresse' | 'estOuvert' | 'horaires' | 'note'>
    >,
  ): Promise<Restaurant>;
  abstract delete(id: number): Promise<void>;
}
