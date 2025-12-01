import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IResidencyRepository } from '../../core/repositories/i-residency.repository';
import { Residency, ResidencyStatus } from '../../core/entities/residency.entity';
import { CreateResidencyDto } from './dto/create-residency.dto';
import { UpdateResidencyDto } from './dto/update-residency.dto';
import { MoveOutDto } from './dto/move-out.dto';

@Injectable()
export class ResidencyService {
  constructor(
    @Inject(IResidencyRepository) private residencyRepository: IResidencyRepository,
  ) {}

  async create(dto: CreateResidencyDto): Promise<Residency> {
    const newResidency = new Residency({
      ...dto,
      status: ResidencyStatus.ACTIVE,
      moveInDate: dto.moveInDate || new Date(),
    });
    return this.residencyRepository.create(newResidency);
  }

  async findAll(): Promise<Residency[]> {
    return this.residencyRepository.findAll();
  }

  async findOne(id: number): Promise<Residency> {
    const residency = await this.residencyRepository.findById(id);
    if (!residency) {
      throw new NotFoundException('İkamet kaydı bulunamadı.');
    }
    return residency;
  }

  async update(id: number, dto: UpdateResidencyDto): Promise<Residency> {
    await this.findOne(id);
    return this.residencyRepository.update(id, dto);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    return this.residencyRepository.delete(id);
  }

  async findByUnit(unitId: number): Promise<Residency[]> {
    return this.residencyRepository.findByUnitId(unitId);
  }

  async findByUser(userId: number): Promise<Residency[]> {
    return this.residencyRepository.findByUserId(userId);
  }

  async moveOut(id: number, dto: MoveOutDto): Promise<Residency> {
    await this.findOne(id);
    return this.residencyRepository.update(id, {
      status: ResidencyStatus.MOVED_OUT,
      moveOutDate: dto.moveOutDate || new Date(),
    });
  }
}

