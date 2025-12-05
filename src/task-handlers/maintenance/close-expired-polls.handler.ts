import { Injectable, Logger, Inject } from '@nestjs/common';
import { ITaskHandler, TaskContext, TaskResult } from '../../core/interfaces/i-task-handler';
import { TaskHandler } from '../../infrastructure/common/decorators/task-handler.decorator';
import { IPollRepository } from '../../core/repositories/i-poll.repository';
import { PollStatus } from '../../core/entities/poll-status.enum';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PollClosedEvent } from '../../core/events/poll-closed.event';

@TaskHandler('close-expired-polls', {
  description: 'Süresi dolan anketleri otomatik olarak kapatır',
  category: 'maintenance',
})
@Injectable()
export class CloseExpiredPollsHandler implements ITaskHandler {
  name = 'close-expired-polls';
  description = 'Süresi dolan anketleri otomatik olarak kapatır';
  private readonly logger = new Logger(CloseExpiredPollsHandler.name);

  constructor(
    @Inject(IPollRepository) private pollRepository: IPollRepository,
    private eventEmitter: EventEmitter2,
  ) {}

  async execute(payload: any, context: TaskContext): Promise<TaskResult> {
    this.logger.log('Starting to close expired polls...');

    try {
      // Süresi dolan anketleri bul
      const expiredPolls = await this.pollRepository.findExpired();

      if (expiredPolls.length === 0) {
        this.logger.log('No expired polls found.');
        return {
          success: true,
          data: {
            closedCount: 0,
            timestamp: new Date(),
          },
          message: 'No expired polls found.',
        };
      }

      let closedCount = 0;
      const errors: string[] = [];

      // Her anketi kapat
      for (const poll of expiredPolls) {
        try {
          await this.pollRepository.update(poll.id, {
            status: PollStatus.CLOSED,
          });

          // Event emit et
          this.eventEmitter.emit(
            'poll.closed',
            new PollClosedEvent(poll.id, poll.title, new Date()),
          );

          closedCount++;
          this.logger.log(`Closed poll: ${poll.id} - ${poll.title}`);
        } catch (error) {
          const errorMessage = `Failed to close poll ${poll.id}: ${error instanceof Error ? error.message : String(error)}`;
          this.logger.error(errorMessage);
          errors.push(errorMessage);
        }
      }

      this.logger.log(`Closed ${closedCount} expired polls.`);

      return {
        success: true,
        data: {
          closedCount,
          totalExpired: expiredPolls.length,
          errors: errors.length > 0 ? errors : undefined,
          timestamp: new Date(),
        },
        message: `${closedCount} anket kapatıldı`,
      };
    } catch (error) {
      const errorMessage = `Failed to close expired polls: ${error instanceof Error ? error.message : String(error)}`;
      this.logger.error(errorMessage, error);
      return {
        success: false,
        data: {
          error: errorMessage,
          timestamp: new Date(),
        },
        message: `Hata: ${errorMessage}`,
      };
    }
  }
}

