import { Injectable, Inject } from '@nestjs/common';
import { INotificationRepository } from '../../core/repositories/i-notification.repository';
import { Notification } from '../../core/entities/notification.entity';
import { FilterNotificationDto } from './dto/filter-notification.dto';
import { NotificationService as InfrastructureNotificationService } from '../../infrastructure/common/services/notification.service';
import { NotificationChannel } from '../../core/entities/notification-channel.enum';
import { NotificationStatus } from '../../core/entities/notification-status.enum';

@Injectable()
export class NotificationService {
  constructor(
    @Inject(INotificationRepository) private notificationRepository: INotificationRepository,
    private infrastructureNotificationService: InfrastructureNotificationService,
  ) {}

  async findAll(filterDto: FilterNotificationDto) {
    if (filterDto.userId) {
      return this.notificationRepository.findByUser(filterDto.userId, filterDto.limit || 50);
    }
    // Admin için tüm bildirimler (ileride pagination eklenebilir)
    return this.notificationRepository.findByStatus(filterDto.status || NotificationStatus.SENT);
  }

  async findById(id: number): Promise<Notification> {
    const notification = await this.notificationRepository.findById(id);
    if (!notification) {
      throw new Error('Notification not found');
    }
    return notification;
  }

  async sendByTemplate(
    userId: number,
    templateCode: string,
    variables: Record<string, any>,
  ): Promise<Notification[]> {
    return this.infrastructureNotificationService.sendByTemplate(userId, templateCode, variables);
  }

  async sendDirect(
    userId: number,
    channel: NotificationChannel,
    recipient: string,
    subject: string,
    body: string,
    bodyHtml?: string,
  ): Promise<Notification> {
    return this.infrastructureNotificationService.sendDirect(
      userId,
      channel,
      recipient,
      subject,
      body,
      bodyHtml,
    );
  }
}

