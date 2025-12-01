import { Injectable, Logger, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PaymentCreatedEvent } from '../../../core/events/payment-created.event';
import { DebtCreatedEvent } from '../../../core/events/debt-created.event';
import { DebtOverdueEvent } from '../../../core/events/debt-overdue.event';
import { UserCreatedEvent } from '../../../core/events/user-created.event';
import { NotificationService } from '../services/notification.service';
import { IUserRepository } from '../../../core/repositories/i-user.repository';

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
}

