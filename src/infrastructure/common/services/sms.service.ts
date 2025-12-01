import { Injectable, Logger } from '@nestjs/common';
import { ISmsService } from '../../../core/interfaces/i-sms-service';

/**
 * SMS Service - Mock implementation
 * Sonradan gerçek SMS provider (Netgsm, IletiMerkezi, vb.) entegre edilebilir
 */
@Injectable()
export class SmsService implements ISmsService {
  private readonly logger = new Logger(SmsService.name);

  async sendSms(options: { to: string; message: string }): Promise<void> {
    // Mock implementation - sadece loglama yapıyor
    // Gerçek entegrasyon için provider API'sine istek atılacak
    this.logger.log(`[MOCK SMS] To: ${options.to}, Message: ${options.message.substring(0, 50)}...`);
    
    // TODO: Gerçek SMS provider entegrasyonu
    // Örnek: Netgsm, IletiMerkezi, Twilio, vb.
    // await this.smsProvider.send(options.to, options.message);
    
    // Şimdilik başarılı dönüyor
    return Promise.resolve();
  }
}

