import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IBlockRepository } from '../../core/repositories/i-block.repository';
import { Block } from '../../core/entities/block.entity';
import { CreateBlockDto } from './dto/create-block.dto';
import { UpdateBlockDto } from './dto/update-block.dto';

@Injectable()
export class BlockService {
  constructor(
    @Inject(IBlockRepository) private blockRepository: IBlockRepository,
  ) {}

  async create(dto: CreateBlockDto, userId: number) {
    const newBlock = new Block({
      ...dto,
      createdById: userId,
    });
    return this.blockRepository.create(newBlock);
  }

  async findAllBySite(siteId: number) {
    return this.blockRepository.findAllBySiteId(siteId);
  }

  async findOne(id: number) {
    const block = await this.blockRepository.findById(id);
    if (!block) throw new NotFoundException('Blok bulunamadı.');
    return block;
  }

  async update(id: number, dto: UpdateBlockDto, userId: number) {
    await this.findOne(id);
    return this.blockRepository.update(id, { ...dto, updatedById: userId });
  }

  async remove(id: number, userId: number) {
    await this.findOne(id);
    return this.blockRepository.delete(id, userId);
  }
}