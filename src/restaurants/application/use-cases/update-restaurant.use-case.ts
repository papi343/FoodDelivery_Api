import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Restaurant } from '../../domain/entities/restaurant.entity';
import { RestaurantRepository } from '../../domain/repositories/restaurant.repository';
import { Role } from '../../../common/enums/role.enum';

@Injectable()
export class UpdateRestaurantUseCase {
  constructor(private readonly restaurantRepository: RestaurantRepository) {}

  async execute(
    id: number,
    requester: { id: number; role: Role },
    data: Partial<
      Pick<Restaurant, 'nom' | 'adresse' | 'estOuvert' | 'horaires' | 'note'>
    >,
  ): Promise<Restaurant> {
    const existing = await this.restaurantRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Restaurant #${id} introuvable`);
    }

    if (
      requester.role !== Role.ADMIN &&
      existing.ownerId !== requester.id
    ) {
      throw new ForbiddenException(
        'Vous ne pouvez modifier que vos propres restaurants',
      );
    }

    return this.restaurantRepository.update(id, data);
  }
}
