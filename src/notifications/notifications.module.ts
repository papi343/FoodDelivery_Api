import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationRepository } from './domain/repositories/notification.repository';
import { PrismaNotificationRepository } from './infrastructure/repositories/prisma-notification.repository';
import { GetMyNotificationsUseCase } from './application/use-cases/get-my-notifications.use-case';
import { MarkNotificationAsReadUseCase } from './application/use-cases/mark-notification-as-read.use-case';
import { NotificationsGateway } from './gateway';
import { NotificationsController } from './presentation/http/notifications.controller';

@Module({
  imports: [PrismaModule],
  controllers: [NotificationsController],
  providers: [
    GetMyNotificationsUseCase,
    MarkNotificationAsReadUseCase,
    NotificationsGateway,
    PrismaNotificationRepository,
    {
      provide: NotificationRepository,
      useExisting: PrismaNotificationRepository,
    },
  ],
  exports: [NotificationRepository, NotificationsGateway],
})
export class NotificationsModule {}
