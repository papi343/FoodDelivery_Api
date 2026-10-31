import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { GetDashboardStatsUseCase } from '../../application/use-cases/get-dashboard-stats.use-case';
import { ManageUsersUseCase } from '../../application/use-cases/manage-users.use-case';
import { GetAllOrdersAdminUseCase } from '../../application/use-cases/get-all-orders-admin.use-case';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../common/enums/role.enum';

// Contrôleur d'administration globale (réservé au rôle ADMIN)
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(
    private readonly getDashboardStatsUseCase: GetDashboardStatsUseCase,
    private readonly manageUsersUseCase: ManageUsersUseCase,
    private readonly getAllOrdersAdminUseCase: GetAllOrdersAdminUseCase,
  ) {}

  // Statistiques globales du tableau de bord
  @Get('dashboard')
  async getDashboard() {
    return this.getDashboardStatsUseCase.execute();
  }

  // Liste de tous les utilisateurs
  @Get('users')
  async getAllUsers() {
    return this.manageUsersUseCase.findAll();
  }

  // Changement du rôle d'un utilisateur
  @Patch('users/:id/role')
  async updateUserRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return this.manageUsersUseCase.updateRole(id, dto.role);
  }

  // Suppression d'un utilisateur
  @Delete('users/:id')
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.manageUsersUseCase.deleteUser(id);
  }

  // Supervision de toutes les commandes
  @Get('orders')
  async getAllOrders() {
    return this.getAllOrdersAdminUseCase.execute();
  }
}
