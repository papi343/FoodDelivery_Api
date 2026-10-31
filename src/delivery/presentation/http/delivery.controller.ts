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
import { AssignDeliveryUseCase } from '../../application/use-cases/assign-delivery.use-case';
import { UpdateDeliveryStatusUseCase } from '../../application/use-cases/update-delivery-status.use-case';
import { FindDeliveryByIdUseCase } from '../../application/use-cases/find-delivery-by-id.use-case';
import { FindMyDeliveriesUseCase } from '../../application/use-cases/find-my-deliveries.use-case';
import { AssignDeliveryDto } from './dto/assign-delivery.dto';
import { UpdateDeliveryStatusDto } from './dto/update-delivery-status.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Role } from '../../../common/enums/role.enum';

// Contrôleur pour la gestion des livraisons
@Controller('delivery')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DeliveryController {
  constructor(
    private readonly assignDeliveryUseCase: AssignDeliveryUseCase,
    private readonly updateDeliveryStatusUseCase: UpdateDeliveryStatusUseCase,
    private readonly findDeliveryByIdUseCase: FindDeliveryByIdUseCase,
    private readonly findMyDeliveriesUseCase: FindMyDeliveriesUseCase,
  ) {}

  // Affecter un livreur à une commande
  @Post('assign')
  @Roles(Role.ADMIN, Role.RESTAURANT)
  async assign(@Body() dto: AssignDeliveryDto) {
    return this.assignDeliveryUseCase.execute(dto);
  }

  // Voir les livraisons assignées au livreur connecté
  @Get('me')
  @Roles(Role.LIVREUR)
  async findMyDeliveries(@CurrentUser('id') livreurId: number) {
    return this.findMyDeliveriesUseCase.execute(livreurId);
  }

  // Mettre à jour le statut et la position actuelle de la livraison
  @Patch(':id/status')
  @Roles(Role.LIVREUR, Role.ADMIN)
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { id: number; role: Role },
    @Body() dto: UpdateDeliveryStatusDto,
  ) {
    return this.updateDeliveryStatusUseCase.execute(id, user, dto);
  }

  // Suivi d'une livraison par son ID
  @Get(':id')
  @Roles(Role.CLIENT, Role.LIVREUR, Role.ADMIN)
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { id: number; role: Role },
  ) {
    return this.findDeliveryByIdUseCase.execute(id, user);
  }
}
