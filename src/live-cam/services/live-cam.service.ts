import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { LiveCamRepository } from '../repositories/live-cam.repository';
import { StoreFeatureRepository } from '../../stores/repositories/store-feature.repository';
import { CreateStreamDto } from '../dto/create-stream.dto';
import { LiveCamStreamEntity, StreamStatus } from '../entities/live-cam-stream.entity';
import { FeatureKey } from '../../stores/entities/store-feature.entity';

@Injectable()
export class LiveCamService {
  constructor(
    private readonly liveCamRepository: LiveCamRepository,
    private readonly storeFeatureRepository: StoreFeatureRepository,
  ) {}

  async create(storeId: string, dto: CreateStreamDto): Promise<LiveCamStreamEntity> {
    // Checar feature
    const isEnabled = await this.storeFeatureRepository.isFeatureEnabled(storeId, FeatureKey.LIVE_CAM);
    if (!isEnabled) {
      throw new ForbiddenException('FEATURE_NOT_ENABLED');
    }

    // Validar expiresAt no futuro
    const expiresAt = new Date(dto.expiresAt);
    if (expiresAt <= new Date()) {
      throw new ForbiddenException('STREAM_EXPIRED');
    }

    return this.liveCamRepository.create({
      storeId,
      petId: dto.petId,
      serviceContextId: dto.serviceContextId || null,
      streamUrl: dto.streamUrl,
      expiresAt,
      status: StreamStatus.ONLINE,
    });
  }

  async findByPet(customerId: string, petId: string): Promise<LiveCamStreamEntity[]> {
    // TODO: Validar que o pet pertence ao customer

    // Expirar streams antigos
    await this.liveCamRepository.expireOldStreams();

    // Retornar apenas ONLINE
    return this.liveCamRepository.findOnlineByPet(petId);
  }

  async delete(id: string): Promise<void> {
    const stream = await this.liveCamRepository.findById(id);
    if (!stream) {
      throw new NotFoundException('STREAM_NOT_FOUND');
    }

    await this.liveCamRepository.delete(id);
  }
}


