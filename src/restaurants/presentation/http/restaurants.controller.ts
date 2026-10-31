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
import { CreateRestaurantUseCase } from '../../application/use-cases/create-restaurant.use-case';
import { FindAllRestaurantsUseCase } from '../../application/use-cases/find-all-restaurants.use-case';
import { FindRestaurantByIdUseCase } from '../../application/use-cases/find-restaurant-by-id.use-case';
import { UpdateRestaurantUseCase } from '../../application/use-cases/update-restaurant.use-case';
import { DeleteRestaurantUseCase } from '../../application/use-cases/delete-restaurant.use-case';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Role } from '../../../common/enums/role.enum';

// Contrôleur pour la gestion des restaurants
@Controller('restaurants')
export class RestaurantsController {
  constructor(
    private readonly createRestaurantUseCase: CreateRestaurantUseCase,
    private readonly findAllRestaurantsUseCase: FindAllRestaurantsUseCase,
    private readonly findRestaurantByIdUseCase: FindRestaurantByIdUseCase,
    private readonly updateRestaurantUseCase: UpdateRestaurantUseCase,
    private readonly deleteRestaurantUseCase: DeleteRestaurantUseCase,
  ) {}

  // Liste tous les restaurants (route publique)
  @Get()
  async findAll() {
    return this.findAllRestaurantsUseCase.execute();
  }

  // Récupère les détails d'un restaurant avec son menu (route publique)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.findRestaurantByIdUseCase.execute(id);
  }

  // Création d'un restaurant (réservé aux restaurateurs et admins)
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.RESTAURANT, Role.ADMIN)
  async create(
    @CurrentUser('id') userId: number,
    @Body() dto: CreateRestaurantDto,
  ) {
    return this.createRestaurantUseCase.execute({
      ...dto,
      ownerId: userId,
    });
  }

  // Modification des infos ou de la disponibilité d'un restaurant
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.RESTAURANT, Role.ADMIN)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { id: number; role: Role },
    @Body() dto: UpdateRestaurantDto,
  ) {
    return this.updateRestaurantUseCase.execute(id, user, dto);
  }

  // Suppression d'un restaurant (réservé à l'admin)
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.deleteRestaurantUseCase.execute(id);
  }
}
