import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateOrderUseCase } from '../../application/use-cases/create-order.use-case';
import { FindOrderByIdUseCase } from '../../application/use-cases/find-order-by-id.use-case';
import { FindMyOrdersUseCase } from '../../application/use-cases/find-my-orders.use-case';
import { UpdateOrderUseCase } from '../../application/use-cases/update-order.use-case';
import { CancelOrderUseCase } from '../../application/use-cases/cancel-order.use-case';
import { UpdateOrderStatusUseCase } from '../../application/use-cases/update-order-status.use-case';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Role } from '../../../common/enums/role.enum';

// Contrôleur pour la gestion des commandes
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly findOrderByIdUseCase: FindOrderByIdUseCase,
    private readonly findMyOrdersUseCase: FindMyOrdersUseCase,
    private readonly updateOrderUseCase: UpdateOrderUseCase,
    private readonly cancelOrderUseCase: CancelOrderUseCase,
    private readonly updateOrderStatusUseCase: UpdateOrderStatusUseCase,
  ) {}

  // Passer une nouvelle commande (client)
  @Post()
  @Roles(Role.CLIENT)
  async create(
    @CurrentUser('id') clientId: number,
    @Body() dto: CreateOrderDto,
  ) {
    return this.createOrderUseCase.execute(clientId, dto);
  }

  // Historique des commandes du client connecté
  @Get('me')
  @Roles(Role.CLIENT)
  async findMyOrders(@CurrentUser('id') clientId: number) {
    return this.findMyOrdersUseCase.execute(clientId);
  }

  // Suivre une commande par son ID
  @Get(':id')
  @Roles(Role.CLIENT, Role.RESTAURANT, Role.ADMIN)
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { id: number; role: Role },
  ) {
    return this.findOrderByIdUseCase.execute(id, user);
  }

  // Modifier une commande tant qu'elle n'est pas encore en préparation
  @Patch(':id')
  @Roles(Role.CLIENT)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') clientId: number,
    @Body() dto: UpdateOrderDto,
  ) {
    return this.updateOrderUseCase.execute(id, clientId, dto);
  }

  // Annuler une commande
  @Patch(':id/cancel')
  @Roles(Role.CLIENT, Role.RESTAURANT, Role.ADMIN)
  async cancel(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { id: number; role: Role },
  ) {
    return this.cancelOrderUseCase.execute(id, user);
  }

  // Mettre à jour le statut de la commande (restaurateur ou admin)
  @Patch(':id/status')
  @Roles(Role.RESTAURANT, Role.ADMIN)
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { id: number; role: Role },
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.updateOrderStatusUseCase.execute(id, user, dto.statut);
  }
}
