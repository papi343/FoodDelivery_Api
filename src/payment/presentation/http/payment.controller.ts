import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CheckoutPaymentUseCase } from '../../application/use-cases/checkout-payment.use-case';
import { GetPaymentByOrderUseCase } from '../../application/use-cases/get-payment-by-order.use-case';
import { CheckoutPaymentDto } from './dto/checkout-payment.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Role } from '../../../common/enums/role.enum';

// Contrôleur pour la simulation des paiements
@Controller('payment')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentController {
  constructor(
    private readonly checkoutPaymentUseCase: CheckoutPaymentUseCase,
    private readonly getPaymentByOrderUseCase: GetPaymentByOrderUseCase,
  ) {}

  // Simuler le paiement d'une commande
  @Post('checkout')
  @Roles(Role.CLIENT)
  async checkout(
    @CurrentUser('id') clientId: number,
    @Body() dto: CheckoutPaymentDto,
  ) {
    return this.checkoutPaymentUseCase.execute(clientId, dto);
  }

  // Récupérer le statut du paiement d'une commande
  @Get(':orderId')
  @Roles(Role.CLIENT, Role.ADMIN)
  async getByOrder(
    @Param('orderId', ParseIntPipe) orderId: number,
    @CurrentUser() user: { id: number; role: Role },
  ) {
    return this.getPaymentByOrderUseCase.execute(orderId, user);
  }
}
