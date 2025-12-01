import { Injectable, Inject, Logger } from '@nestjs/common';
import { INotificationRepository } from '../../../core/repositories/i-notification.repository';
import { INotificationTemplateRepository } from '../../../core/repositories/i-notification-template.repository';
import { INotificationPreferenceRepository } from '../../../core/repositories/i-notification-preference.repository';
import { IUserRepository } from '../../../core/repositories/i-user.repository';
import { Notification } from '../../../core/entities/notification.entity';
import { NotificationChannel } from '../../../core/entities/notification-channel.enum';
import { NotificationStatus } from '../../../core/entities/notification-status.enum';
import { EmailService } from './email.service';
import { SmsService } from './sms.service';
import { TemplateEngineService } from './template-engine.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @Inject(INotificationRepository) private notificationRepository: INotificationRepository,
    @Inject(INotificationTemplateRepository) private templateRepository: INotificationTemplateRepository,
    @Inject(INotificationPreferenceRepository) private preferenceRepository: INotificationPreferenceRepository,
    @Inject(IUserRepository) private userRepository: IUserRepository,
    private emailService: EmailService,
    private smsService: SmsService,
    private templateEngine: TemplateEngineService,
  ) {}

  /**
   * Template code ile bildirim gönder
   */
  async sendByTemplate(
    userId: number,
    templateCode: string,
    variables: Record<string, any>,
    metadata?: Record<string, any>,
  ): Promise<Notification[]> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    const template = await this.templateRepository.findByCode(templateCode);
    if (!template || !template.isActive) {
      throw new Error(`Template ${templateCode} not found or inactive`);
    }

    // Kullanıcı tercihlerini kontrol et
    const preferences = await this.preferenceRepository.findByUserAndCategory(userId, template.category);
    const allCategoryPreference = await this.preferenceRepository.findByUserCategoryAndChannel(
      userId,
      'ALL',
      template.channel,
    );

    // Tercih kontrolü: Kategori bazlı veya ALL bazlı
    const isEnabled = this.checkPreferenceEnabled(template.category, template.channel, preferences, allCategoryPreference);

    if (!isEnabled) {
      this.logger.log(`Notification disabled for user ${userId}, category ${template.category}, channel ${template.channel}`);
      return [];
    }

    // Template'i render et
    const rendered = this.renderTemplate(template, variables);

    // Notification kaydı oluştur
    const notification = new Notification({
      userId,
      templateId: template.id,
      channel: template.channel,
      status: NotificationStatus.PENDING,
      recipient: this.getRecipient(user, template.channel),
      subject: template.subject ? this.templateEngine.render(template.subject, variables) : undefined,
      body: rendered.text || '',
      bodyHtml: rendered.html,
      variables,
      maxRetries: 3,
      retryCount: 0,
      metadata,
    });

    const savedNotification = await this.notificationRepository.create(notification);

    // Async gönderim (queue'ya eklenebilir, şimdilik direkt gönderiyoruz)
    this.sendNotification(savedNotification).catch((error) => {
      this.logger.error(`Failed to send notification ${savedNotification.id}:`, error);
    });

    return [savedNotification];
  }

  /**
   * Direkt bildirim gönder (template kullanmadan)
   */
  async sendDirect(
    userId: number,
    channel: NotificationChannel,
    recipient: string,
    subject: string,
    body: string,
    bodyHtml?: string,
    metadata?: Record<string, any>,
  ): Promise<Notification> {
    const notification = new Notification({
      userId,
      channel,
      status: NotificationStatus.PENDING,
      recipient,
      subject,
      body,
      bodyHtml,
      maxRetries: 3,
      retryCount: 0,
      metadata,
    });

    const savedNotification = await this.notificationRepository.create(notification);

    // Async gönderim
    this.sendNotification(savedNotification).catch((error) => {
      this.logger.error(`Failed to send notification ${savedNotification.id}:`, error);
    });

    return savedNotification;
  }

  /**
   * Bildirimi gönder (gerçek gönderim)
   */
  private async sendNotification(notification: Notification): Promise<void> {
    try {
      // Status'u güncelle
      await this.notificationRepository.update(notification.id, {
        status: NotificationStatus.PENDING,
      });

      // Channel'a göre gönder
      switch (notification.channel) {
        case NotificationChannel.EMAIL:
          await this.emailService.sendEmail({
            to: notification.recipient,
            subject: notification.subject || 'Bildirim',
            html: notification.bodyHtml || notification.body,
            text: notification.body,
          });
          break;

        case NotificationChannel.SMS:
          await this.smsService.sendSms({
            to: notification.recipient,
            message: notification.body,
          });
          break;

        case NotificationChannel.PUSH:
          // Push notification henüz implement edilmedi
          this.logger.warn('Push notifications not implemented yet');
          break;
      }

      // Başarılı
      await this.notificationRepository.update(notification.id, {
        status: NotificationStatus.SENT,
        sentAt: new Date(),
      });

      this.logger.log(`Notification ${notification.id} sent successfully via ${notification.channel}`);
    } catch (error: any) {
      this.logger.error(`Failed to send notification ${notification.id}:`, error);

      // Retry kontrolü
      if (notification.retryCount < notification.maxRetries) {
        await this.notificationRepository.update(notification.id, {
          retryCount: notification.retryCount + 1,
          status: NotificationStatus.PENDING,
        });
        // Retry logic buraya eklenebilir (queue'ya tekrar ekleme)
      } else {
        await this.notificationRepository.update(notification.id, {
          status: NotificationStatus.FAILED,
          failedAt: new Date(),
          failureReason: error.message,
        });
      }

      throw error;
    }
  }

  /**
   * Template'i render et
   */
  private renderTemplate(template: any, variables: Record<string, any>): { html?: string; text?: string } {
    return {
      html: template.bodyHtml ? this.templateEngine.render(template.bodyHtml, variables) : undefined,
      text: template.bodyText ? this.templateEngine.render(template.bodyText, variables) : undefined,
    };
  }

  /**
   * Kullanıcı tercihlerini kontrol et
   */
  private checkPreferenceEnabled(
    category: string,
    channel: NotificationChannel,
    categoryPreferences: any[],
    allCategoryPreference: any | null,
  ): boolean {
    // ALL kategori tercihi varsa onu kullan
    if (allCategoryPreference) {
      return allCategoryPreference.enabled;
    }

    // Kategori bazlı tercih kontrolü
    const categoryPreference = categoryPreferences.find((p) => p.channel === channel);
    if (categoryPreference) {
      return categoryPreference.enabled;
    }

    // Varsayılan: enabled (tercih yoksa bildirim gönder)
    return true;
  }

  /**
   * Recipient'ı belirle (email veya telefon)
   */
  private getRecipient(user: any, channel: NotificationChannel): string {
    switch (channel) {
      case NotificationChannel.EMAIL:
        return user.email;
      case NotificationChannel.SMS:
        return user.phoneNumber || '';
      default:
        return user.email;
    }
  }

  /**
   * Bekleyen bildirimleri gönder (queue processor için)
   */
  async processPendingNotifications(limit: number = 50): Promise<void> {
    const pending = await this.notificationRepository.findPending(limit);

    for (const notification of pending) {
      try {
        await this.sendNotification(notification);
      } catch (error) {
        this.logger.error(`Failed to process notification ${notification.id}:`, error);
      }
    }
  }
}

