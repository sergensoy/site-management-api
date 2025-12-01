import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { INotificationPreferenceRepository } from '../../core/repositories/i-notification-preference.repository';
import { NotificationPreference } from '../../core/entities/notification-preference.entity';
import { NotificationChannel } from '../../core/entities/notification-channel.enum';
import { CreatePreferenceDto } from './dto/create-preference.dto';
import { UpdatePreferenceDto } from './dto/update-preference.dto';

@Injectable()
export class NotificationPreferenceService {
  constructor(
    @Inject(INotificationPreferenceRepository)
    private preferenceRepository: INotificationPreferenceRepository,
  ) {}

  async create(dto: CreatePreferenceDto, userId: number): Promise<NotificationPreference> {
    const preference = new NotificationPreference({
      userId,
      category: dto.category,
      channel: dto.channel as NotificationChannel,
      enabled: dto.enabled !== undefined ? dto.enabled : true,
    });

    return this.preferenceRepository.upsert(preference);
  }

  async findByUser(userId: number): Promise<NotificationPreference[]> {
    return this.preferenceRepository.findByUser(userId);
  }

  async update(id: number, dto: UpdatePreferenceDto): Promise<NotificationPreference> {
    const preference = await this.preferenceRepository.findByUserCategoryAndChannel(
      dto.userId,
      dto.category,
      dto.channel as NotificationChannel,
    );

    if (!preference) {
      throw new NotFoundException('Preference not found');
    }

    return this.preferenceRepository.update(id, {
      enabled: dto.enabled,
    });
  }

  async delete(id: number): Promise<void> {
    await this.preferenceRepository.delete(id);
  }
}

