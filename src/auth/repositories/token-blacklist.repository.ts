import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { TokenBlacklistEntity } from '../entities/token-blacklist.entity';
import * as crypto from 'crypto';

@Injectable()
export class TokenBlacklistRepository {
  constructor(
    @InjectRepository(TokenBlacklistEntity)
    private readonly repository: Repository<TokenBlacklistEntity>,
  ) {}

  /**
   * Cria hash SHA256 do token para armazenamento e busca
   */
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async addToBlacklist(
    token: string,
    userId: string,
    expiresAt: Date,
    reason: string = 'logout',
  ): Promise<void> {
    const tokenHash = this.hashToken(token);
    
    await this.repository.save({
      tokenHash,
      userId,
      expiresAt,
      reason,
    });
  }

  async isBlacklisted(token: string): Promise<boolean> {
    const tokenHash = this.hashToken(token);
    
    const count = await this.repository.count({
      where: {
        tokenHash,
      },
    });
    
    return count > 0;
  }

  async cleanExpiredTokens(): Promise<void> {
    // Remove tokens que já expiraram naturalmente
    await this.repository.delete({
      expiresAt: LessThan(new Date()),
    });
  }

  async blacklistAllUserTokens(userId: string, expiresAt: Date): Promise<void> {
    // Usado quando usuário troca senha ou em casos de segurança
    // Nota: Isso é um marcador. Em produção, você precisaria
    // de uma estratégia mais elaborada para invalidar todos tokens de um usuário
    await this.repository.save({
      token: `user:${userId}:all`,
      userId,
      expiresAt,
      reason: 'password_change',
    });
  }
}

