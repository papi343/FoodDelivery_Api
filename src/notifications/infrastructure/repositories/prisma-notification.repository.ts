import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Notification } from '../../domain/entities/notification.entity';
import { NotificationRepository } from '../../domain/repositories/notification.repository';

@Injectable()
export class PrismaNotificationRepository extends NotificationRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  private toDomain(record: {
    id: number;
    userId: number;
    type: string;
    message: string;
    lu: boolean;
    createdAt: Date;
  }): Notification {
    return new Notification(
      record.id,
      record.userId,
      record.type,
      record.message,
      record.lu,
      record.createdAt,
    );
  }

  async create(notification: Notification): Promise<Notification> {
    const created = await this.prisma.notification.create({
      data: {
        userId: notification.userId,
        type: notification.type,
        message: notification.message,
        lu: notification.lu,
      },
    });
    return this.toDomain(created);
  }

  async findById(id: number): Promise<Notification | null> {
    const found = await this.prisma.notification.findUnique({ where: { id } });
    return found ? this.toDomain(found) : null;
  }

  async findByUserId(userId: number): Promise<Notification[]> {
    const list = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return list.map((n) => this.toDomain(n));
  }

  async markAsRead(id: number): Promise<Notification> {
    const updated = await this.prisma.notification.update({
      where: { id },
      data: { lu: true },
    });
    return this.toDomain(updated);
  }
}
