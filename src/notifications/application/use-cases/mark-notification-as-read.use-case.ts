import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Notification } from '../../domain/entities/notification.entity';
import { NotificationRepository } from '../../domain/repositories/notification.repository';

@Injectable()
export class MarkNotificationAsReadUseCase {
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(id: number, userId: number): Promise<Notification> {
    const notification = await this.notificationRepository.findById(id);
    if (!notification) {
      throw new NotFoundException(`Notification #${id} introuvable`);
    }
    if (notification.userId !== userId) {
      throw new ForbiddenException(
        'Vous ne pouvez modifier que vos propres notifications',
      );
    }
    return this.notificationRepository.markAsRead(id);
  }
}
