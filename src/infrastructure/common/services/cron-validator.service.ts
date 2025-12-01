import { Injectable } from '@nestjs/common';
import { CronJob } from 'cron';

@Injectable()
export class CronValidatorService {
  /**
   * Cron expression'ın geçerli olup olmadığını kontrol et
   */
  isValidCronExpression(cronExpression: string): boolean {
    try {
      new CronJob(cronExpression, () => {}, null, false);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Cron expression'ı validate et ve hata mesajı döndür
   */
  validateCronExpression(cronExpression: string): { valid: boolean; error?: string } {
    try {
      new CronJob(cronExpression, () => {}, null, false);
      return { valid: true };
    } catch (error: any) {
      return {
        valid: false,
        error: error.message || 'Geçersiz cron expression',
      };
    }
  }

  /**
   * Cron expression'ın bir sonraki çalışma zamanını hesapla
   */
  getNextExecutionTime(cronExpression: string): Date | null {
    try {
      const job = new CronJob(cronExpression, () => {}, null, false);
      const nextDates = job.nextDates(1);
      if (nextDates && nextDates.length > 0) {
        const nextDate = nextDates[0];
        // Luxon DateTime ise toJSDate() kullan, değilse direkt Date
        return nextDate && typeof nextDate.toJSDate === 'function' 
          ? nextDate.toJSDate() 
          : (nextDate as any as Date);
      }
      return null;
    } catch {
      return null;
    }
  }
}

