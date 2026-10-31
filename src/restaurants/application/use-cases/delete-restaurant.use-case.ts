import { Injectable, NotFoundException } from '@nestjs/common';
import { RestaurantRepository } from '../../domain/repositories/restaurant.repository';

@Injectable()
export class DeleteRestaurantUseCase {
  constructor(private readonly restaurantRepository: RestaurantRepository) {}

  async execute(id: number): Promise<{ message: string }> {
    const existing = await this.restaurantRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Restaurant #${id} introuvable`);
    }

    await this.restaurantRepository.delete(id);
    return { message: `Restaurant #${id} supprimé avec succès` };
  }
}
