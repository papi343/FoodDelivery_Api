import { Notification } from '../entities/notification.entity';

export abstract class NotificationRepository {
  abstract create(notification: Notification): Promise<Notification>;
  abstract findById(id: number): Promise<Notification | null>;
  abstract findByUserId(userId: number): Promise<Notification[]>;
  abstract markAsRead(id: number): Promise<Notification>;
}
