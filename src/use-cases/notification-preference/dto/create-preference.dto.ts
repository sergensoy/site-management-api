import { IsEnum, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { NotificationChannel } from '../../../core/entities/notification-channel.enum';

export class CreatePreferenceDto {
  @IsNotEmpty()
  category!: string; // "PAYMENT", "DEBT", "ANNOUNCEMENT", "SYSTEM", "ALL"

  @IsEnum(NotificationChannel)
  channel!: NotificationChannel;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}

