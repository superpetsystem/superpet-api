import { Injectable, UnauthorizedException, BadRequestException, Inject, forwardRef, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersRepository } from '../users/users.repository';
import { UserEntity, UserStatus, UserRole } from '../users/entities/user.entity';
import { EmployeesRepository } from '../employees/repositories/employees.repository';
import { EmployeeRole, JobTitle } from '../employees/entities/employee.entity';
import { PasswordResetRepository } from './repositories/password-reset.repository';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { TokenBlacklistRepository } from './repositories/token-blacklist.repository';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
    private configService: ConfigService,
    private passwordResetRepository: PasswordResetRepository,
    @Inject(forwardRef(() => EmployeesRepository))
    private employeesRepository: EmployeesRepository,
    private tokenBlacklistRepository: TokenBlacklistRepository,
  ) {}

  async validateUser(email: string, password: string, organizationId?: string): Promise<any> {
    // Buscar por email globalmente se organizationId não for fornecido
    const user = organizationId 
      ? await this.usersRepository.findByEmail(organizationId, email)
      : await this.usersRepository.findByEmailGlobal(email);
    
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('User is not active');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password: _, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      organizationId: user.organizationId,
      role: user.role, // Adicionar role do USER (SUPER_ADMIN ou USER)
    };

    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async register(organizationId: string, email: string, name: string, password: string): Promise<UserEntity> {
    const existingUser = await this.usersRepository.findByEmail(organizationId, email);
    
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.usersRepository.create({
      organizationId,
      email,
      name,
      password: hashedPassword,
      status: UserStatus.ACTIVE,
    });

    // Criar Employee com role OWNER e jobTitle OWNER para o usuário registrado
    await this.employeesRepository.create({
      userId: user.id,
      organizationId,
      role: EmployeeRole.OWNER,
      jobTitle: JobTitle.OWNER,
      active: true,
    });

    return user;
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.usersRepository.findById(id);
  }

  /**
   * Forgot Password - Gera token de reset
   */
  async forgotPassword(email: string): Promise<{ message: string; token?: string }> {
    this.logger.log(`🔐 Forgot password request - Email: ${email}`);

    const user = await this.usersRepository.findByEmailGlobal(email);
    
    if (!user) {
      // Por segurança, retornar sucesso mesmo se usuário não existir
      this.logger.warn(`⚠️  Forgot password for non-existent email: ${email}`);
      return { message: 'If email exists, reset instructions sent' };
    }

    // Deletar tokens antigos do usuário
    await this.passwordResetRepository.deleteByUserId(user.id);

    // Gerar token seguro
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Expira em 1 hora

    await this.passwordResetRepository.create({
      userId: user.id,
      token,
      expiresAt,
      used: false,
    });

    this.logger.log(`✅ Password reset token generated - UserID: ${user.id}`);

    // TODO: Enviar email com o token
    // await this.emailService.sendPasswordReset(user.email, token);

    // Em desenvolvimento, retornar o token (REMOVER em produção!)
    if (this.configService.get('NODE_ENV') === 'local') {
      return { 
        message: 'Reset token generated', 
        token // Apenas para desenvolvimento!
      };
    }

    return { message: 'If email exists, reset instructions sent' };
  }

  /**
   * Reset Password - Reseta senha com token
   */
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    this.logger.log(`🔐 Reset password attempt - Token: ${token.substring(0, 8)}...`);

    const resetRequest = await this.passwordResetRepository.findByToken(token);

    if (!resetRequest) {
      this.logger.error(`❌ Invalid or expired token - Token: ${token.substring(0, 8)}...`);
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Verificar se expirou
    if (resetRequest.expiresAt < new Date()) {
      this.logger.error(`❌ Expired token - Token: ${token.substring(0, 8)}...`);
      throw new BadRequestException('Reset token has expired');
    }

    // Atualizar senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersRepository.update(resetRequest.userId, {
      password: hashedPassword,
    });

    // Marcar token como usado
    await this.passwordResetRepository.markAsUsed(resetRequest.id);

    this.logger.log(`✅ Password reset successful - UserID: ${resetRequest.userId}`);

    return { message: 'Password reset successful' };
  }

  /**
   * Change Password - Troca senha (usuário autenticado)
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    this.logger.log(`🔐 Change password request - UserID: ${userId}`);

    const user = await this.usersRepository.findById(userId);

    if (!user || !user.password) {
      throw new BadRequestException('User not found');
    }

    // Verificar senha atual
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isPasswordValid) {
      this.logger.error(`❌ Invalid current password - UserID: ${userId}`);
      throw new BadRequestException('Current password is incorrect');
    }

    // Verificar se nova senha é diferente
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      throw new BadRequestException('New password must be different from current');
    }

    // Atualizar senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersRepository.update(userId, {
      password: hashedPassword,
    });

    this.logger.log(`✅ Password changed successfully - UserID: ${userId}`);

    return { message: 'Password changed successfully' };
  }

  /**
   * Refresh Token - Gera novo access token
   */
  async refreshToken(refreshToken: string): Promise<{ access_token: string }> {
    this.logger.log(`🔄 Refresh token request`);

    try {
      // Verificar refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.usersRepository.findById(payload.sub);

      if (!user || user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Gerar novo access token
      const newPayload = {
        email: user.email,
        sub: user.id,
        organizationId: user.organizationId,
      };

      const access_token = this.jwtService.sign(newPayload);

      this.logger.log(`✅ Token refreshed - UserID: ${user.id}`);

      return { access_token };
    } catch (error) {
      this.logger.error(`❌ Refresh token failed - Error: ${error.message}`);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Logout - invalida o access token (e opcionalmente o refresh) via blacklist
   */
  async logout(accessToken: string, refreshToken?: string): Promise<{ message: string }>{
    // Extrair exp e sub do access token sem validar (já validado pelo guard)
    const decodedAccess: any = this.jwtService.decode(accessToken);
    const expSec = decodedAccess?.exp;
    const sub = decodedAccess?.sub;
    const accessExpiresAt = expSec ? new Date(expSec * 1000) : new Date(Date.now() + 15 * 60 * 1000);

    if (sub) {
      await this.tokenBlacklistRepository.addToBlacklist(accessToken, sub, accessExpiresAt, 'logout');
    }

    if (refreshToken) {
      try {
        const decodedRefresh: any = this.jwtService.verify(refreshToken, {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        });
        const refreshExp = decodedRefresh?.exp ? new Date(decodedRefresh.exp * 1000) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await this.tokenBlacklistRepository.addToBlacklist(refreshToken, decodedRefresh.sub, refreshExp, 'logout');
      } catch (_) {
        // Ignorar refresh inválido
      }
    }

    return { message: 'Logged out' };
  }

  /**
   * Login com refresh token
   */
  async loginWithRefresh(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      organizationId: user.organizationId,
    };

    const refreshPayload = {
      sub: user.id,
      type: 'refresh',
    };

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(refreshPayload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d') as any,
      }),
      user,
    };
  }
}

