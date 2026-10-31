import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateMenuItemUseCase } from '../../application/use-cases/create-menu-item.use-case';
import { FindMenuByRestaurantUseCase } from '../../application/use-cases/find-menu-by-restaurant.use-case';
import { UpdateMenuItemUseCase } from '../../application/use-cases/update-menu-item.use-case';
import { DeleteMenuItemUseCase } from '../../application/use-cases/delete-menu-item.use-case';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Role } from '../../../common/enums/role.enum';

// Contrôleur pour gérer les plats du menu d'un restaurant
@Controller()
export class MenuController {
  constructor(
    private readonly createMenuItemUseCase: CreateMenuItemUseCase,
    private readonly findMenuByRestaurantUseCase: FindMenuByRestaurantUseCase,
    private readonly updateMenuItemUseCase: UpdateMenuItemUseCase,
    private readonly deleteMenuItemUseCase: DeleteMenuItemUseCase,
  ) {}

  // Récupère le menu complet d'un restaurant
  @Get('restaurants/:id/menu')
  async findByRestaurant(@Param('id', ParseIntPipe) restaurantId: number) {
    return this.findMenuByRestaurantUseCase.execute(restaurantId);
  }

  // Ajoute un plat au menu d'un restaurant
  @Post('restaurants/:id/menu')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.RESTAURANT, Role.ADMIN)
  async addMenuItem(
    @Param('id', ParseIntPipe) restaurantId: number,
    @CurrentUser() user: { id: number; role: Role },
    @Body() dto: CreateMenuItemDto,
  ) {
    return this.createMenuItemUseCase.execute(restaurantId, user, dto);
  }

  // Modifie un plat existant
  @Patch('menu/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.RESTAURANT, Role.ADMIN)
  async updateMenuItem(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { id: number; role: Role },
    @Body() dto: UpdateMenuItemDto,
  ) {
    return this.updateMenuItemUseCase.execute(id, user, dto);
  }

  // Supprime un plat du menu
  @Delete('menu/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.RESTAURANT, Role.ADMIN)
  async deleteMenuItem(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { id: number; role: Role },
  ) {
    return this.deleteMenuItemUseCase.execute(id, user);
  }
}
