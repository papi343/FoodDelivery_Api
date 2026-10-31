import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Server, Socket } from 'socket.io';
import { NotificationRepository } from './domain/repositories/notification.repository';
import { Notification } from './domain/entities/notification.entity';

// Gateway WebSocket (Socket.IO) pour les notifications en temps réel
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  // À la connexion, l'utilisateur rejoint automatiquement sa room user:<id>
  handleConnection(client: Socket) {
    const userId =
      client.handshake.auth?.userId ?? client.handshake.query?.userId;
    if (userId) {
      const room = `user:${userId}`;
      void client.join(room);
      this.logger.log(`Client ${client.id} connecté dans la room ${room}`);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client déconnecté : ${client.id}`);
  }

  // Permet à un utilisateur de rejoindre sa room manuellement
  @SubscribeMessage('joinUserRoom')
  handleJoinUserRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { userId: number },
  ) {
    const room = `user:${payload.userId}`;
    void client.join(room);
    return { event: 'joinedUserRoom', room };
  }

  // Permet de suivre une commande en direct dans la room order:<id>
  @SubscribeMessage('joinOrderRoom')
  handleJoinOrderRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { orderId: number },
  ) {
    const room = `order:${payload.orderId}`;
    void client.join(room);
    return { event: 'joinedOrderRoom', room };
  }

  // Diffusion directe de la position du livreur via WebSocket
  @SubscribeMessage('delivery:locationUpdate')
  handleDriverLocationBroadcast(
    @MessageBody()
    payload: {
      orderId: number;
      clientId?: number;
      positionActuelle: string;
    },
  ) {
    this.server.to(`order:${payload.orderId}`).emit('delivery:locationUpdate', {
      orderId: payload.orderId,
      positionActuelle: payload.positionActuelle,
      timestamp: new Date().toISOString(),
    });
    if (payload.clientId) {
      this.server
        .to(`user:${payload.clientId}`)
        .emit('delivery:locationUpdate', {
          orderId: payload.orderId,
          positionActuelle: payload.positionActuelle,
          timestamp: new Date().toISOString(),
        });
    }
    return { status: 'broadcasted' };
  }

  // Écoute le changement de statut d'une commande et notifie le client
  @OnEvent('order.statusChanged')
  async handleOrderStatusChanged(payload: {
    order: { id: number; clientId: number; statut: string };
  }) {
    const { order } = payload;
    const message = `Votre commande #${order.id} est maintenant en statut : ${order.statut}`;

    await this.notificationRepository.create(
      new Notification(
        null,
        order.clientId,
        'order:statusChanged',
        message,
        false,
      ),
    );

    const data = {
      orderId: order.id,
      statut: order.statut,
      message,
      timestamp: new Date().toISOString(),
    };

    this.server?.to(`user:${order.clientId}`).emit('order:statusChanged', data);
    this.server?.to(`order:${order.id}`).emit('order:statusChanged', data);
  }

  // Notifie le livreur lorsqu'une livraison lui est assignée
  @OnEvent('delivery.assigned')
  async handleDeliveryAssigned(payload: {
    delivery: { id: number; orderId: number; livreurId: number };
    order: { id: number; adresseLivraison: string };
  }) {
    const { delivery, order } = payload;
    const message = `Nouvelle mission de livraison #${delivery.id} assignée pour la commande #${order.id} (${order.adresseLivraison})`;

    await this.notificationRepository.create(
      new Notification(
        null,
        delivery.livreurId,
        'delivery:assigned',
        message,
        false,
      ),
    );

    this.server?.to(`user:${delivery.livreurId}`).emit('delivery:assigned', {
      deliveryId: delivery.id,
      orderId: order.id,
      adresseLivraison: order.adresseLivraison,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  // Envoie la mise à jour de position du livreur au client
  @OnEvent('delivery.locationUpdate')
  handleDeliveryLocationUpdate(payload: {
    delivery: { id: number; orderId: number; positionActuelle: string | null };
    clientId: number;
  }) {
    const { delivery, clientId } = payload;
    const data = {
      deliveryId: delivery.id,
      orderId: delivery.orderId,
      positionActuelle: delivery.positionActuelle,
      timestamp: new Date().toISOString(),
    };

    this.server?.to(`user:${clientId}`).emit('delivery:locationUpdate', data);
    this.server
      ?.to(`order:${delivery.orderId}`)
      .emit('delivery:locationUpdate', data);
  }

  // Notifie le restaurateur dès qu'une nouvelle commande est créée
  @OnEvent('restaurant.newOrder')
  async handleRestaurantNewOrder(payload: {
    order: { id: number; restaurantId: number; total: number };
    restaurantOwnerId: number;
  }) {
    const { order, restaurantOwnerId } = payload;
    const message = `Nouvelle commande #${order.id} reçue (Total : ${order.total})`;

    await this.notificationRepository.create(
      new Notification(
        null,
        restaurantOwnerId,
        'restaurant:newOrder',
        message,
        false,
      ),
    );

    this.server
      ?.to(`user:${restaurantOwnerId}`)
      .emit('restaurant:newOrder', {
        orderId: order.id,
        restaurantId: order.restaurantId,
        total: order.total,
        message,
        timestamp: new Date().toISOString(),
      });
  }
}
