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
export class CreateMenuItemUseCase {
  constructor(
    private readonly menuItemRepository: MenuItemRepository,
    private readonly restaurantRepository: RestaurantRepository,
  ) {}

  async execute(
    restaurantId: number,
    requester: { id: number; role: Role },
    input: {
      nom: string;
      description?: string;
      prix: number;
      disponible?: boolean;
      categorie: string;
    },
  ): Promise<MenuItem> {
    const restaurant = await this.restaurantRepository.findById(restaurantId);
    if (!restaurant) {
      throw new NotFoundException(`Restaurant #${restaurantId} introuvable`);
    }

    if (
      requester.role !== Role.ADMIN &&
      restaurant.ownerId !== requester.id
    ) {
      throw new ForbiddenException(
        'Vous ne pouvez ajouter des plats qu’à votre propre restaurant',
      );
    }

    const item = new MenuItem(
      null,
      restaurantId,
      input.nom,
      input.description ?? null,
      input.prix,
      input.disponible ?? true,
      input.categorie,
    );

    return this.menuItemRepository.create(item);
  }
}
