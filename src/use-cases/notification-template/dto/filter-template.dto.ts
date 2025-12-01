import { IsEnum, IsOptional, IsString } from 'class-validator';
import { NotificationChannel } from '../../../core/entities/notification-channel.enum';

export class FilterTemplateDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsEnum(NotificationChannel)
  channel?: NotificationChannel;
}

