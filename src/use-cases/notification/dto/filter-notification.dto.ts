import { IsOptional, IsNumber, IsEnum, IsString } from 'class-validator';
import { NotificationStatus } from '../../../core/entities/notification-status.enum';

export class FilterNotificationDto {
  @IsOptional()
  @IsNumber()
  userId?: number;

  @IsOptional()
  @IsEnum(NotificationStatus)
  status?: NotificationStatus;

  @IsOptional()
  @IsNumber()
  limit?: number;
}

