import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { INotificationTemplateRepository } from '../../core/repositories/i-notification-template.repository';
import { NotificationTemplate } from '../../core/entities/notification-template.entity';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { FilterTemplateDto } from './dto/filter-template.dto';

@Injectable()
export class NotificationTemplateService {
  constructor(
    @Inject(INotificationTemplateRepository)
    private templateRepository: INotificationTemplateRepository,
  ) {}

  async create(dto: CreateTemplateDto): Promise<NotificationTemplate> {
    // Code unique kontrolü
    const existing = await this.templateRepository.findByCode(dto.code);
    if (existing) {
      throw new ConflictException('Template code already exists');
    }

    const template = new NotificationTemplate({
      code: dto.code,
      name: dto.name,
      description: dto.description,
      category: dto.category,
      channel: dto.channel,
      subject: dto.subject,
      bodyHtml: dto.bodyHtml,
      bodyText: dto.bodyText,
      variables: dto.variables,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
      isSystem: false,
    });

    return this.templateRepository.create(template);
  }

  async findAll(filterDto?: FilterTemplateDto): Promise<NotificationTemplate[]> {
    if (filterDto?.category) {
      return this.templateRepository.findByCategory(filterDto.category);
    }
    if (filterDto?.channel) {
      return this.templateRepository.findByChannel(filterDto.channel);
    }
    return this.templateRepository.findAll();
  }

  async findById(id: number): Promise<NotificationTemplate> {
    const template = await this.templateRepository.findById(id);
    if (!template) {
      throw new NotFoundException('Template not found');
    }
    return template;
  }

  async findByCode(code: string): Promise<NotificationTemplate> {
    const template = await this.templateRepository.findByCode(code);
    if (!template) {
      throw new NotFoundException('Template not found');
    }
    return template;
  }

  async update(id: number, dto: UpdateTemplateDto): Promise<NotificationTemplate> {
    await this.findById(id); // Var mı kontrol et

    // Code değişikliği varsa unique kontrolü
    if (dto.code) {
      const existing = await this.templateRepository.findByCode(dto.code);
      if (existing && existing.id !== id) {
        throw new ConflictException('Template code already exists');
      }
    }

    return this.templateRepository.update(id, dto as Partial<NotificationTemplate>);
  }

  async delete(id: number): Promise<void> {
    const template = await this.findById(id);
    if (template.isSystem) {
      throw new ConflictException('System templates cannot be deleted');
    }
    await this.templateRepository.delete(id);
  }
}

