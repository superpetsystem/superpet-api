import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UsersRepository } from '../users/users.repository';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { UserEntity } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, name } = registerDto;

    // Verificar se o usuário já existe
    const existingUser = await this.usersRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar usuário
    const user = await this.usersRepository.create({
      email,
      password: hashedPassword,
      name,
      refreshToken: null,
    });

    // Gerar tokens
    const tokens = await this.generateTokens(user);

    // Salvar refresh token
    const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);
    await this.usersRepository.updateRefreshToken(user.id, hashedRefreshToken);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Buscar usuário
    const user = await this.usersRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Gerar tokens
    const tokens = await this.generateTokens(user);

    // Salvar refresh token
    const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);
    await this.usersRepository.updateRefreshToken(user.id, hashedRefreshToken);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async logout(userId: string): Promise<void> {
    await this.usersRepository.updateRefreshToken(userId, null);
  }

  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    try {
      // Verificar se o token é válido
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // Buscar usuário
      const user = await this.usersRepository.findById(payload.sub);
      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Verificar se o refresh token corresponde ao armazenado
      const isRefreshTokenValid = await bcrypt.compare(
        refreshToken,
        user.refreshToken,
      );
      if (!isRefreshTokenValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Gerar novos tokens
      const tokens = await this.generateTokens(user);

      // Atualizar refresh token
      const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);
      await this.usersRepository.updateRefreshToken(user.id, hashedRefreshToken);

      return {
        ...tokens,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async generateTokens(user: UserEntity): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const payload = { sub: user.id, email: user.email };

    const jwtSecret = this.configService.get<string>('JWT_SECRET')!;
    const jwtExpiresIn = this.configService.get('JWT_EXPIRES_IN') || '15m';
    const jwtRefreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET')!;
    const jwtRefreshExpiresIn = this.configService.get('JWT_REFRESH_EXPIRES_IN') || '7d';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: jwtSecret,
        expiresIn: jwtExpiresIn,
      } as any),
      this.jwtService.signAsync(payload, {
        secret: jwtRefreshSecret,
        expiresIn: jwtRefreshExpiresIn,
      } as any),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async validateUser(userId: string): Promise<UserEntity> {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  async getProfile(userId: string) {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verificar senha atual
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atualizar senha
    user.password = hashedPassword;
    await this.usersRepository.save(user);
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.usersRepository.findByEmail(email);
    
    // Por segurança, sempre retorna sucesso mesmo se o email não existir
    // Isso evita que atacantes descubram quais emails estão cadastrados
    if (!user) {
      return {
        message: 'If the email exists, a password reset link has been sent',
      };
    }

    // Gerar token aleatório
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash do token para armazenar no banco
    const hashedToken = await bcrypt.hash(resetToken, 10);
    
    // Token expira em 1 hora
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Salvar token e expiração no usuário
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = expiresAt;
    await this.usersRepository.save(user);

    // TODO: Enviar email com o token
    // Em produção, você enviaria um email com um link como:
    // https://seusite.com/reset-password?token=${resetToken}
    
    console.log('='.repeat(80));
    console.log('🔐 PASSWORD RESET TOKEN (APENAS PARA DESENVOLVIMENTO)');
    console.log('='.repeat(80));
    console.log(`Email: ${email}`);
    console.log(`Token: ${resetToken}`);
    console.log(`Expires: ${expiresAt.toISOString()}`);
    console.log('='.repeat(80));
    console.log('⚠️  Em produção, este token seria enviado por EMAIL');
    console.log('='.repeat(80));

    return {
      message: 'If the email exists, a password reset link has been sent',
    };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    // Buscar usuário com token de reset válido (não expirado)
    const users = await this.usersRepository.findAll();
    
    let userToReset: UserEntity | null = null;

    for (const user of users) {
      if (
        user.resetPasswordToken &&
        user.resetPasswordExpires &&
        user.resetPasswordExpires > new Date()
      ) {
        // Verificar se o token corresponde
        const isTokenValid = await bcrypt.compare(token, user.resetPasswordToken);
        if (isTokenValid) {
          userToReset = user;
          break;
        }
      }
    }

    if (!userToReset) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atualizar senha e limpar token de reset
    userToReset.password = hashedPassword;
    userToReset.resetPasswordToken = null;
    userToReset.resetPasswordExpires = null;
    userToReset.refreshToken = null; // Invalidar refresh tokens existentes

    await this.usersRepository.save(userToReset);

    return {
      message: 'Password has been reset successfully',
    };
  }
}

