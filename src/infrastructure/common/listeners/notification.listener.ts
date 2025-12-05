import { Injectable, Logger, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PaymentCreatedEvent } from '../../../core/events/payment-created.event';
import { DebtCreatedEvent } from '../../../core/events/debt-created.event';
import { DebtOverdueEvent } from '../../../core/events/debt-overdue.event';
import { UserCreatedEvent } from '../../../core/events/user-created.event';
import { AnnouncementPublishedEvent } from '../../../core/events/announcement-published.event';
import { PollPublishedEvent } from '../../../core/events/poll-published.event';
import { PollClosedEvent } from '../../../core/events/poll-closed.event';
import { NotificationService } from '../services/notification.service';
import { IUserRepository } from '../../../core/repositories/i-user.repository';
import { TargetAudienceType } from '../../../core/entities/target-audience-type.enum';

@Injectable()
export class NotificationListener {
  private readonly logger = new Logger(NotificationListener.name);

  constructor(
    private notificationService: NotificationService,
    @Inject(IUserRepository) private userRepository: IUserRepository,
  ) {}

  @OnEvent('payment.created')
  async handlePaymentCreated(event: PaymentCreatedEvent) {
    this.logger.log(`Payment created event received: ${event.paymentId}`);
    
    try {
      const user = await this.userRepository.findById(event.userId);
      if (!user) {
        this.logger.warn(`User ${event.userId} not found for payment notification`);
        return;
      }

      await this.notificationService.sendByTemplate(
        event.userId,
        'payment.created',
        {
          userName: `${user.firstName} ${user.lastName}`,
          amount: event.amount,
          paymentId: event.paymentId,
        },
        {
          eventType: 'payment.created',
          paymentId: event.paymentId,
          debtId: event.debtId,
        },
      );
    } catch (error) {
      this.logger.error(`Failed to send payment notification:`, error);
    }
  }

  @OnEvent('debt.created')
  async handleDebtCreated(event: DebtCreatedEvent) {
    this.logger.log(`Debt created event received: ${event.debtId}`);
    
    try {
      const user = await this.userRepository.findById(event.userId);
      if (!user) {
        this.logger.warn(`User ${event.userId} not found for debt notification`);
        return;
      }

      await this.notificationService.sendByTemplate(
        event.userId,
        'debt.created',
        {
          userName: `${user.firstName} ${user.lastName}`,
          amount: event.amount,
          dueDate: event.dueDate,
          debtId: event.debtId,
        },
        {
          eventType: 'debt.created',
          debtId: event.debtId,
        },
      );
    } catch (error) {
      this.logger.error(`Failed to send debt notification:`, error);
    }
  }

  @OnEvent('debt.overdue')
  async handleDebtOverdue(event: DebtOverdueEvent) {
    this.logger.log(`Debt overdue event received: ${event.debtId}`);
    
    try {
      const user = await this.userRepository.findById(event.userId);
      if (!user) {
        this.logger.warn(`User ${event.userId} not found for overdue debt notification`);
        return;
      }

      await this.notificationService.sendByTemplate(
        event.userId,
        'debt.overdue',
        {
          userName: `${user.firstName} ${user.lastName}`,
          amount: event.amount,
          dueDate: event.dueDate,
          debtId: event.debtId,
        },
        {
          eventType: 'debt.overdue',
          debtId: event.debtId,
        },
      );
    } catch (error) {
      this.logger.error(`Failed to send overdue debt notification:`, error);
    }
  }

  @OnEvent('user.created')
  async handleUserCreated(event: UserCreatedEvent) {
    this.logger.log(`User created event received: ${event.userId}`);
    
    try {
      await this.notificationService.sendByTemplate(
        event.userId,
        'welcome.email',
        {
          userName: `${event.firstName} ${event.lastName}`,
          email: event.email,
        },
        {
          eventType: 'user.created',
          userId: event.userId,
        },
      );
    } catch (error) {
      this.logger.error(`Failed to send welcome email:`, error);
    }
  }

  @OnEvent('announcement.published')
  async handleAnnouncementPublished(event: AnnouncementPublishedEvent) {
    this.logger.log(`Announcement published event received: ${event.announcement.id}`);
    
    try {
      const announcement = event.announcement;
      const targetUserIds: number[] = [];

      // Hedef kitleye göre kullanıcı ID'lerini topla
      switch (announcement.targetAudience) {
        case TargetAudienceType.ALL:
          // Tüm aktif kullanıcılar
          const allUsers = await this.userRepository.findAll();
          targetUserIds.push(...allUsers.filter(u => u.isActive).map(u => u.id));
          break;

        case TargetAudienceType.USERS:
          // Belirli kullanıcılar
          if (announcement.targetIds) {
            targetUserIds.push(...announcement.targetIds);
          }
          break;

        case TargetAudienceType.SITE:
          // Site'e ait kullanıcılar (residency üzerinden)
          // Bu logic daha detaylı implement edilebilir
          // Şimdilik sadece log
          this.logger.log(`Site-based announcement: ${announcement.siteId}`);
          break;

        case TargetAudienceType.UNITS:
        case TargetAudienceType.BLOCKS:
          // Unit/Block bazlı kullanıcılar (residency üzerinden)
          // Bu logic daha detaylı implement edilebilir
          this.logger.log(`Unit/Block-based announcement`);
          break;
      }

      // Hedef kitleye bildirim gönder
      for (const userId of targetUserIds) {
        try {
          const user = await this.userRepository.findById(userId);
          if (!user || !user.isActive) continue;

          await this.notificationService.sendByTemplate(
            userId,
            'announcement.published',
            {
              userName: `${user.firstName} ${user.lastName}`,
              announcementTitle: announcement.title,
              announcementId: announcement.id,
            },
            {
              eventType: 'announcement.published',
              announcementId: announcement.id,
            },
          );
        } catch (error) {
          this.logger.error(`Failed to send announcement notification to user ${userId}:`, error);
        }
      }

      this.logger.log(`Sent announcement notifications to ${targetUserIds.length} users`);
    } catch (error) {
      this.logger.error(`Failed to send announcement notifications:`, error);
    }
  }

  @OnEvent('poll.published')
  async handlePollPublished(event: PollPublishedEvent) {
    this.logger.log(`Poll published event received: ${event.pollId}`);

    try {
      const targetUserIds: number[] = [];

      // Hedef kitleye göre kullanıcı ID'lerini topla
      switch (event.targetAudience) {
        case TargetAudienceType.ALL:
          // Tüm aktif kullanıcılar
          const allUsers = await this.userRepository.findAll();
          targetUserIds.push(...allUsers.filter(u => u.isActive).map(u => u.id));
          break;

        case TargetAudienceType.USERS:
          // Belirli kullanıcılar
          if (event.targetIds) {
            targetUserIds.push(...event.targetIds);
          }
          break;

        case TargetAudienceType.SITE:
          // Site'e ait kullanıcılar (residency üzerinden)
          // Bu logic daha detaylı implement edilebilir
          this.logger.log(`Site-based poll: ${event.siteId}`);
          break;

        case TargetAudienceType.UNITS:
        case TargetAudienceType.BLOCKS:
          // Unit/Block bazlı kullanıcılar (residency üzerinden)
          // Bu logic daha detaylı implement edilebilir
          this.logger.log(`Unit/Block-based poll`);
          break;
      }

      // Hedef kitleye bildirim gönder
      for (const userId of targetUserIds) {
        try {
          const user = await this.userRepository.findById(userId);
          if (!user || !user.isActive) continue;

          await this.notificationService.sendByTemplate(
            userId,
            'poll.published',
            {
              userName: `${user.firstName} ${user.lastName}`,
              pollTitle: event.title,
              pollId: event.pollId,
            },
            {
              eventType: 'poll.published',
              pollId: event.pollId,
            },
          );
        } catch (error) {
          this.logger.error(`Failed to send poll notification to user ${userId}:`, error);
        }
      }

      this.logger.log(`Sent poll notifications to ${targetUserIds.length} users`);
    } catch (error) {
      this.logger.error(`Failed to send poll notifications:`, error);
    }
  }

  @OnEvent('poll.closed')
  async handlePollClosed(event: PollClosedEvent) {
    this.logger.log(`Poll closed event received: ${event.pollId}`);

    try {
      // Anket kapandığında bildirim gönderme (opsiyonel)
      // Şimdilik sadece log
      this.logger.log(`Poll ${event.pollId} (${event.title}) closed at ${event.closedAt}`);
    } catch (error) {
      this.logger.error(`Failed to handle poll closed event:`, error);
    }
  }
}

