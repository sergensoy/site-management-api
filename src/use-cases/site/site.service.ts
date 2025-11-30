import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ISiteRepository } from '../../core/repositories/i-site.repository';
import { Site } from '../../core/entities/site.entity';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';

@Injectable()
export class SiteService {
  constructor(
    @Inject(ISiteRepository) private siteRepository: ISiteRepository,
  ) {}

  async create(dto: CreateSiteDto, userId: number) {
    const newSite = new Site({
      ...dto,
      createdById: userId,
    });
    return this.siteRepository.create(newSite);
  }

  async findAll() {
    return this.siteRepository.findAll();
  }

  async findOne(id: number) {
    const site = await this.siteRepository.findById(id);
    if (!site) throw new NotFoundException('Site bulunamadı.');
    return site;
  }

  async update(id: number, dto: UpdateSiteDto, userId: number) {
    await this.findOne(id); // Kontrol
    return this.siteRepository.update(id, { ...dto, updatedById: userId });
  }

  async remove(id: number, userId: number) {
    await this.findOne(id);
    return this.siteRepository.delete(id, userId);
  }
}