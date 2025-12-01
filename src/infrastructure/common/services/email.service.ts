import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { IEmailService } from '../../../core/interfaces/i-email-service';

@Injectable()
export class EmailService implements IEmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured = false;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    // SMTP configuration kontrolü
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      this.logger.warn(
        'SMTP configuration not found. Email notifications will be disabled. ' +
        'Please set SMTP_USER and SMTP_PASSWORD in .env file to enable email notifications.',
      );
      this.isConfigured = false;
      return;
    }

    // SMTP configuration from environment variables
    const smtpConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    };

    try {
      // Create transporter
      this.transporter = nodemailer.createTransport(smtpConfig);
      this.isConfigured = true;

      // Verify connection (async, non-blocking)
      this.transporter.verify((error) => {
        if (error) {
          this.logger.warn(
            'SMTP connection verification failed. Email notifications may not work. ' +
            'Error: ' + error.message,
          );
          this.isConfigured = false;
        } else {
          this.logger.log('SMTP server is ready to send emails');
        }
      });
    } catch (error: any) {
      this.logger.error('Failed to initialize SMTP transporter:', error);
      this.isConfigured = false;
    }
  }

  async sendEmail(options: {
    to: string;
    subject: string;
    html?: string;
    text?: string;
    from?: string;
  }): Promise<void> {
    // SMTP yapılandırılmamışsa sadece loglama yap
    if (!this.isConfigured || !this.transporter) {
      this.logger.warn(
        `Email sending skipped (SMTP not configured): To: ${options.to}, Subject: ${options.subject}`,
      );
      return;
    }

    try {
      const mailOptions = {
        from: options.from || process.env.SMTP_FROM || process.env.SMTP_USER,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || this.stripHtml(options.html || ''),
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent successfully to ${options.to}: ${info.messageId}`);
    } catch (error: any) {
      this.logger.error(`Failed to send email to ${options.to}:`, error);
      // Hata durumunda exception fırlatma, sadece logla
      // Böylece bildirim sistemi çalışmaya devam eder
      throw new Error(`Email sending failed: ${error.message}`);
    }
  }

  private stripHtml(html: string): string {
    // Simple HTML stripping - can be improved with a library
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  }
}

