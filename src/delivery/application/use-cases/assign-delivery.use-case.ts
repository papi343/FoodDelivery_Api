import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Delivery } from '../../domain/entities/delivery.entity';
import { DeliveryRepository } from '../../domain/repositories/delivery.repository';
import { OrderRepository } from '../../../orders/domain/repositories/order.repository';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { DeliveryStatus } from '../../../common/enums/delivery-status.enum';
import { OrderStatus } from '../../../common/enums/order-status.enum';
import { Role } from '../../../common/enums/role.enum';

@Injectable()
export class AssignDeliveryUseCase {
  constructor(
    private readonly deliveryRepository: DeliveryRepository,
    private readonly orderRepository: OrderRepository,
    private readonly userRepository: UserRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(input: {
    orderId: number;
    livreurId: number;
    positionActuelle?: string;
    heureEstimee?: string;
  }): Promise<Delivery> {
    const order = await this.orderRepository.findById(input.orderId);
    if (!order) {
      throw new NotFoundException(`Commande #${input.orderId} introuvable`);
    }

    if (order.statut === OrderStatus.ANNULEE) {
      throw new BadRequestException(
        'Impossible d’affecter un livreur à une commande annulée',
      );
    }

    const existingDelivery = await this.deliveryRepository.findByOrderId(
      input.orderId,
    );
    if (existingDelivery) {
      throw new ConflictException(
        `Une livraison existe déjà pour la commande #${input.orderId}`,
      );
    }

    const livreur = await this.userRepository.findById(input.livreurId);
    if (!livreur || livreur.role !== Role.LIVREUR) {
      throw new BadRequestException(
        `L'utilisateur #${input.livreurId} n'est pas un livreur valide`,
      );
    }

    const delivery = new Delivery(
      null,
      input.orderId,
      input.livreurId,
      DeliveryStatus.ASSIGNEE,
      input.positionActuelle ?? null,
      input.heureEstimee ? new Date(input.heureEstimee) : null,
    );

    const createdDelivery = await this.deliveryRepository.create(delivery);

    const updatedOrder = await this.orderRepository.updateStatus(
      input.orderId,
      OrderStatus.EN_LIVRAISON,
    );

    this.eventEmitter.emit('delivery.assigned', {
      delivery: createdDelivery,
      order: updatedOrder,
    });

    this.eventEmitter.emit('order.statusChanged', {
      order: updatedOrder,
    });

    return createdDelivery;
  }
}
