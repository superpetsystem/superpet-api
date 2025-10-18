import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UsersModule } from '../users/users.module';
import { TokenBlacklistEntity } from './entities/token-blacklist.entity';
import { TokenBlacklistRepository } from './repositories/token-blacklist.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([TokenBlacklistEntity]),
    UsersModule,
    PassportModule,
    JwtModule.register({}), // Configuração será feita dinamicamente no service
    ConfigModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, TokenBlacklistRepository],
  exports: [AuthService, JwtAuthGuard, TokenBlacklistRepository],
})
export class AuthModule {}

