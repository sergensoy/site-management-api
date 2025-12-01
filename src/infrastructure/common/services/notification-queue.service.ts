import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { NotificationService } from './notification.service';

/**
 * Notification Queue Service
 * Bekleyen bildirimleri periyodik olarak işler
 */
@Injectable()
export class NotificationQueueService implements OnModuleInit {
  private readonly logger = new Logger(NotificationQueueService.name);

  constructor(private notificationService: NotificationService) {}

  onModuleInit() {
    this.logger.log('Notification Queue Service initialized');
  }

  /**
   * Bekleyen bildirimleri işle (manuel çağrılabilir veya scheduled task ile)
   */
  async processPendingNotifications() {
    this.logger.debug('Processing pending notifications...');
    try {
      await this.notificationService.processPendingNotifications(50);
    } catch (error) {
      this.logger.error('Error processing pending notifications:', error);
    }
  }
}

