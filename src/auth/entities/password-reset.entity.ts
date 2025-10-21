import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('password_resets')
export class PasswordResetEntity extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column()
  token: string;

  @Column({ name: 'expires_at' })
  expiresAt: Date;

  @Column({ name: 'used', default: false })
  used: boolean;
}

