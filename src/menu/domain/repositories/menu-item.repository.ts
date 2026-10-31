import { MenuItem } from '../entities/menu-item.entity';

export abstract class MenuItemRepository {
  abstract create(item: MenuItem): Promise<MenuItem>;
  abstract findById(id: number): Promise<MenuItem | null>;
  abstract findByIds(ids: number[]): Promise<MenuItem[]>;
  abstract findByRestaurantId(restaurantId: number): Promise<MenuItem[]>;
  abstract update(
    id: number,
    data: Partial<
      Pick<MenuItem, 'nom' | 'description' | 'prix' | 'disponible' | 'categorie'>
    >,
  ): Promise<MenuItem>;
  abstract delete(id: number): Promise<void>;
}
