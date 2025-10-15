import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('token_blacklist')
@Index('IDX_TOKEN_BLACKLIST_HASH', ['tokenHash'])
@Index('IDX_TOKEN_BLACKLIST_EXPIRES', ['expiresAt'])
export class TokenBlacklistEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 64, unique: true })
  tokenHash: string; // SHA256 hash do token (para indexação)

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column()
  userId: string;

  @Column({ type: 'varchar', length: 50, default: 'logout' })
  reason: string; // 'logout', 'password_change', 'security', etc
}

