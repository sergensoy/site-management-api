import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IUnitRepository } from '../../core/repositories/i-unit.repository';
import { Unit } from '../../core/entities/unit.entity';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';

@Injectable()
export class UnitService {
  constructor(
    @Inject(IUnitRepository) private unitRepository: IUnitRepository,
  ) {}

  async create(dto: CreateUnitDto, userId: number) {
    const newUnit = new Unit({
      ...dto,
      createdById: userId,
    });
    return this.unitRepository.create(newUnit);
  }

  async findAllByBlock(blockId: number) {
    return this.unitRepository.findAllByBlockId(blockId);
  }

  async findOne(id: number) {
    const unit = await this.unitRepository.findById(id);
    if (!unit) throw new NotFoundException('Daire bulunamadı.');
    return unit;
  }

  async update(id: number, dto: UpdateUnitDto, userId: number) {
    await this.findOne(id);
    return this.unitRepository.update(id, { ...dto, updatedById: userId });
  }

  async remove(id: number, userId: number) {
    await this.findOne(id);
    return this.unitRepository.delete(id, userId);
  }
}