import { IsEnum, IsNotEmpty, IsOptional, IsString, IsBoolean, IsObject } from 'class-validator';
import { NotificationChannel } from '../../../core/entities/notification-channel.enum';

export class CreateTemplateDto {
  @IsNotEmpty()
  @IsString()
  code!: string; // "payment.created", "debt.overdue", vb.

  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsString()
  category!: string; // "PAYMENT", "DEBT", "ANNOUNCEMENT", "SYSTEM"

  @IsEnum(NotificationChannel)
  channel!: NotificationChannel;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  bodyHtml?: string;

  @IsOptional()
  @IsString()
  bodyText?: string;

  @IsOptional()
  @IsObject()
  variables?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

