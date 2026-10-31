import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MenuItem } from '../../domain/entities/menu-item.entity';
import { MenuItemRepository } from '../../domain/repositories/menu-item.repository';
import { RestaurantRepository } from '../../../restaurants/domain/repositories/restaurant.repository';
import { Role } from '../../../common/enums/role.enum';

@Injectable()
export class UpdateMenuItemUseCase {
  constructor(
    private readonly menuItemRepository: MenuItemRepository,
    private readonly restaurantRepository: RestaurantRepository,
  ) {}

  async execute(
    id: number,
    requester: { id: number; role: Role },
    data: Partial<
      Pick<MenuItem, 'nom' | 'description' | 'prix' | 'disponible' | 'categorie'>
    >,
  ): Promise<MenuItem> {
    const item = await this.menuItemRepository.findById(id);
    if (!item) {
      throw new NotFoundException(`Plat #${id} introuvable`);
    }

    const restaurant = await this.restaurantRepository.findById(
      item.restaurantId,
    );
    if (
      requester.role !== Role.ADMIN &&
      restaurant?.ownerId !== requester.id
    ) {
      throw new ForbiddenException(
        'Vous ne pouvez modifier que les plats de votre restaurant',
      );
    }

    return this.menuItemRepository.update(id, data);
  }
}
