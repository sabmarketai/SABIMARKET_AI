import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a notification for a user, respecting their notifications_enabled
   * preference. Returns null (without throwing) when the user has opted out,
   * since "notification not created because disabled" is not an error.
   */
  async create(
    userId: string,
    type: string,
    title: string,
    message: string,
  ) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      select: { notifications_enabled: true },
    });

    if (!user?.notifications_enabled) {
      return null;
    }

    return this.prisma.notifications.create({
      data: {
        user_id: userId,
        type,
        title,
        message,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.notifications.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });
  }

  async findUnread(userId: string) {
    return this.prisma.notifications.findMany({
      where: { user_id: userId, is_read: false },
      orderBy: { created_at: 'desc' },
    });
  }

  async markAsRead(id: bigint, userId: string) {
    const notification = await this.prisma.notifications.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.user_id !== userId) {
      throw new ForbiddenException(
        'You do not have access to this notification',
      );
    }

    return this.prisma.notifications.update({
      where: { id },
      data: { is_read: true },
    });
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notifications.updateMany({
      where: { user_id: userId, is_read: false },
      data: { is_read: true },
    });

    return { message: 'All notifications marked as read' };
  }
}
