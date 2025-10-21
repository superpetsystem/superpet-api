import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { LiveCamStreamEntity, StreamStatus } from '../entities/live-cam-stream.entity';

@Injectable()
export class LiveCamRepository {
  constructor(
    @InjectRepository(LiveCamStreamEntity)
    private readonly repository: Repository<LiveCamStreamEntity>,
  ) {}

  async create(data: Partial<LiveCamStreamEntity>): Promise<LiveCamStreamEntity> {
    const stream = this.repository.create(data);
    return this.repository.save(stream);
  }

  async findById(id: string): Promise<LiveCamStreamEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['pet', 'store'],
    });
  }

  async findByPet(petId: string, status?: StreamStatus): Promise<LiveCamStreamEntity[]> {
    const where: any = { petId };

    if (status) {
      where.status = status;
    }

    return this.repository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findOnlineByPet(petId: string): Promise<LiveCamStreamEntity[]> {
    return this.repository.find({
      where: {
        petId,
        status: StreamStatus.ONLINE,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async expireOldStreams(): Promise<void> {
    await this.repository.update(
      {
        expiresAt: LessThan(new Date()),
        status: StreamStatus.ONLINE,
      },
      { status: StreamStatus.EXPIRED },
    );
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}


