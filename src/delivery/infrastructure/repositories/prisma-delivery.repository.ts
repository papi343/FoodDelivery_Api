import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Delivery } from '../../domain/entities/delivery.entity';
import { DeliveryRepository } from '../../domain/repositories/delivery.repository';
import { DeliveryStatus } from '../../../common/enums/delivery-status.enum';

@Injectable()
export class PrismaDeliveryRepository extends DeliveryRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  private toDomain(record: {
    id: number;
    orderId: number;
    livreurId: number;
    statut: string;
    positionActuelle: string | null;
    heureEstimee: Date | null;
    createdAt: Date;
  }): Delivery {
    return new Delivery(
      record.id,
      record.orderId,
      record.livreurId,
      record.statut as DeliveryStatus,
      record.positionActuelle,
      record.heureEstimee,
      record.createdAt,
    );
  }

  async create(delivery: Delivery): Promise<Delivery> {
    const created = await this.prisma.delivery.create({
      data: {
        orderId: delivery.orderId,
        livreurId: delivery.livreurId,
        statut: delivery.statut,
        positionActuelle: delivery.positionActuelle,
        heureEstimee: delivery.heureEstimee,
      },
    });
    return this.toDomain(created);
  }

  async findById(id: number): Promise<Delivery | null> {
    const found = await this.prisma.delivery.findUnique({ where: { id } });
    return found ? this.toDomain(found) : null;
  }

  async findByOrderId(orderId: number): Promise<Delivery | null> {
    const found = await this.prisma.delivery.findUnique({
      where: { orderId },
    });
    return found ? this.toDomain(found) : null;
  }

  async findByLivreurId(livreurId: number): Promise<Delivery[]> {
    const list = await this.prisma.delivery.findMany({
      where: { livreurId },
      orderBy: { createdAt: 'desc' },
    });
    return list.map((d) => this.toDomain(d));
  }

  async updateStatusAndLocation(
    id: number,
    data: {
      statut?: DeliveryStatus;
      positionActuelle?: string;
      heureEstimee?: Date;
    },
  ): Promise<Delivery> {
    const updated = await this.prisma.delivery.update({
      where: { id },
      data,
    });
    return this.toDomain(updated);
  }
}
