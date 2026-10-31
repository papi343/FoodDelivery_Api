import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MenuItemRepository } from '../../domain/repositories/menu-item.repository';
import { RestaurantRepository } from '../../../restaurants/domain/repositories/restaurant.repository';
import { Role } from '../../../common/enums/role.enum';

@Injectable()
export class DeleteMenuItemUseCase {
  constructor(
    private readonly menuItemRepository: MenuItemRepository,
    private readonly restaurantRepository: RestaurantRepository,
  ) {}

  async execute(
    id: number,
    requester: { id: number; role: Role },
  ): Promise<{ message: string }> {
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
        'Vous ne pouvez retirer que les plats de votre restaurant',
      );
    }

    await this.menuItemRepository.delete(id);
    return { message: `Plat #${id} retiré du menu avec succès` };
  }
}
