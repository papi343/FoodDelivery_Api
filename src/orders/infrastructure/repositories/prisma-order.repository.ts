import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Order } from '../../domain/entities/order.entity';
import { OrderItem } from '../../domain/entities/order-item.entity';
import { OrderRepository } from '../../domain/repositories/order.repository';
import { OrderStatus } from '../../../common/enums/order-status.enum';

@Injectable()
export class PrismaOrderRepository extends OrderRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  private toDomain(record: {
    id: number;
    clientId: number;
    restaurantId: number;
    statut: string;
    total: number;
    adresseLivraison: string;
    createdAt: Date;
    items?: Array<{
      id: number;
      orderId: number;
      menuItemId: number;
      quantite: number;
      prixUnitaire: number;
      menuItem?: { nom: string };
    }>;
  }): Order {
    const items = (record.items ?? []).map(
      (item) =>
        new OrderItem(
          item.id,
          item.orderId,
          item.menuItemId,
          item.quantite,
          item.prixUnitaire,
          item.menuItem?.nom,
        ),
    );
    return new Order(
      record.id,
      record.clientId,
      record.restaurantId,
      items,
      record.statut as OrderStatus,
      record.total,
      record.adresseLivraison,
      record.createdAt,
    );
  }

  async create(order: Order): Promise<Order> {
    const created = await this.prisma.order.create({
      data: {
        clientId: order.clientId,
        restaurantId: order.restaurantId,
        statut: order.statut,
        total: order.total,
        adresseLivraison: order.adresseLivraison,
        items: {
          create: order.items.map((item) => ({
            menuItemId: item.menuItemId,
            quantite: item.quantite,
            prixUnitaire: item.prixUnitaire,
          })),
        },
      },
      include: {
        items: {
          include: { menuItem: { select: { nom: true } } },
        },
      },
    });
    return this.toDomain(created);
  }

  async findById(id: number): Promise<Order | null> {
    const found = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: { menuItem: { select: { nom: true } } },
        },
      },
    });
    return found ? this.toDomain(found) : null;
  }

  async findByClientId(clientId: number): Promise<Order[]> {
    const list = await this.prisma.order.findMany({
      where: { clientId },
      include: {
        items: {
          include: { menuItem: { select: { nom: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return list.map((o) => this.toDomain(o));
  }

  async findByRestaurantId(restaurantId: number): Promise<Order[]> {
    const list = await this.prisma.order.findMany({
      where: { restaurantId },
      include: {
        items: {
          include: { menuItem: { select: { nom: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return list.map((o) => this.toDomain(o));
  }

  async findAll(): Promise<Order[]> {
    const list = await this.prisma.order.findMany({
      include: {
        items: {
          include: { menuItem: { select: { nom: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return list.map((o) => this.toDomain(o));
  }

  async updateOrderDetails(
    id: number,
    data: {
      adresseLivraison?: string;
      items?: OrderItem[];
      total?: number;
    },
  ): Promise<Order> {
    const updated = await this.prisma.$transaction(async (tx) => {
      if (data.items) {
        await tx.orderItem.deleteMany({ where: { orderId: id } });
      }
      return tx.order.update({
        where: { id },
        data: {
          ...(data.adresseLivraison !== undefined && {
            adresseLivraison: data.adresseLivraison,
          }),
          ...(data.total !== undefined && { total: data.total }),
          ...(data.items && {
            items: {
              create: data.items.map((item) => ({
                menuItemId: item.menuItemId,
                quantite: item.quantite,
                prixUnitaire: item.prixUnitaire,
              })),
            },
          }),
        },
        include: {
          items: {
            include: { menuItem: { select: { nom: true } } },
          },
        },
      });
    });

    return this.toDomain(updated);
  }

  async updateStatus(id: number, statut: OrderStatus): Promise<Order> {
    const updated = await this.prisma.order.update({
      where: { id },
      data: { statut },
      include: {
        items: {
          include: { menuItem: { select: { nom: true } } },
        },
      },
    });
    return this.toDomain(updated);
  }
}
