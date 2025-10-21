import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UsersModule } from '../users/users.module';
import { TokenBlacklistEntity } from './entities/token-blacklist.entity';
import { PasswordResetEntity } from './entities/password-reset.entity';
import { TokenBlacklistRepository } from './repositories/token-blacklist.repository';
import { PasswordResetRepository } from './repositories/password-reset.repository';
import { EmployeesModule } from '../employees/employees.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TokenBlacklistEntity,
      PasswordResetEntity,
    ]),
    UsersModule,
    forwardRef(() => EmployeesModule),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN', '15m') as any,
        },
      }),
    }),
    ConfigModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    TokenBlacklistRepository,
    PasswordResetRepository,
  ],
  exports: [
    AuthService,
    JwtAuthGuard,
    TokenBlacklistRepository,
  ],
})
export class AuthModule {}

