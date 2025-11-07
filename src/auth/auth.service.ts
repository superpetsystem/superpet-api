/**
 * ============================================
 * AUTH.SERVICE.TS - SERVIÇO DE AUTENTICAÇÃO
 * ============================================
 * 
 * Este service contém toda a lógica de negócio relacionada à autenticação.
 * 
 * RESPONSABILIDADES:
 * - Validar credenciais de usuários
 * - Gerar e validar JWT tokens
 * - Gerenciar registro de novos usuários
 * - Reset e troca de senhas
 * - Logout (blacklist de tokens)
 * - Refresh tokens
 * 
 * SEGURANÇA:
 * - Senhas são hasheadas com bcrypt (nunca armazenadas em texto plano)
 * - Tokens JWT são assinados com chave secreta
 * - Tokens invalidados são armazenados em blacklist
 */

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

/**
 * @Injectable() - Marca a classe como um provider do NestJS
 * 
 * Permite que seja injetada em controllers e outros services.
 */
@Injectable()
export class AuthService {
  /**
   * Logger - Sistema de logs do NestJS
   * 
   * Permite registrar eventos importantes:
   * - logger.log(): Informações gerais
   * - logger.warn(): Avisos
   * - logger.error(): Erros
   * 
   * Útil para debug e monitoramento em produção.
   */
  private readonly logger = new Logger(AuthService.name);

  /**
   * Constructor com Dependency Injection
   * 
   * O NestJS injeta automaticamente todas as dependências aqui.
   * 
   * Dependências:
   * - usersRepository: Acesso aos dados de usuários
   * - jwtService: Geração e validação de JWT tokens
   * - configService: Acesso a variáveis de ambiente
   * - passwordResetRepository: Gerenciar tokens de reset
   * - employeesRepository: Buscar dados de funcionários (forwardRef para evitar dependência circular)
   * - tokenBlacklistRepository: Gerenciar tokens invalidados
   */
  constructor(
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
    private configService: ConfigService,
    private passwordResetRepository: PasswordResetRepository,
    @Inject(forwardRef(() => EmployeesRepository))
    private employeesRepository: EmployeesRepository,
    private tokenBlacklistRepository: TokenBlacklistRepository,
  ) {}

  /**
   * validateUser() - Valida credenciais de um usuário
   * 
   * Este método é usado durante o login para verificar se o email e senha
   * são válidos.
   * 
   * FLUXO:
   * 1. Busca o usuário por email (global ou por organização)
   * 2. Verifica se o usuário existe e tem senha
   * 3. Verifica se o usuário está ativo
   * 4. Compara a senha fornecida com o hash armazenado (bcrypt)
   * 5. Retorna o usuário sem a senha (por segurança)
   * 
   * @param email - Email do usuário
   * @param password - Senha em texto plano (será comparada com hash)
   * @param organizationId - ID da organização (opcional, para multi-tenant)
   * @returns Usuário sem a senha
   * @throws UnauthorizedException se credenciais inválidas ou usuário inativo
   */
  async validateUser(email: string, password: string, organizationId?: string): Promise<any> {
    /**
     * Buscar usuário por email
     * 
     * Se organizationId for fornecido: busca dentro da organização (multi-tenant)
     * Se não: busca globalmente (email é único no sistema)
     */
    const user = organizationId 
      ? await this.usersRepository.findByEmail(organizationId, email)
      : await this.usersRepository.findByEmailGlobal(email);
    
    /**
     * Validação 1: Usuário existe e tem senha
     * 
     * Se o usuário não existir ou não tiver senha (ex: login social),
     * retorna erro genérico para não vazar informações.
     */
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    /**
     * Validação 2: Usuário está ativo
     * 
     * Usuários podem estar: ACTIVE, INACTIVE, SUSPENDED, etc.
     * Apenas usuários ativos podem fazer login.
     */
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('User is not active');
    }

    /**
     * Validação 3: Senha está correta
     * 
     * bcrypt.compare():
     * - Compara a senha em texto plano com o hash armazenado
     * - É seguro contra timing attacks
     * - Retorna true se a senha estiver correta
     * 
     * IMPORTANTE: Nunca compare senhas diretamente!
     * Sempre use bcrypt.compare() para comparar com hash.
     */
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    /**
     * Retorna o usuário SEM a senha
     * 
     * Destructuring: { password: _, ...result }
     * - Remove o campo 'password' do objeto
     * - Retorna todos os outros campos
     * 
     * Por segurança, senhas nunca devem ser retornadas em respostas.
     */
    const { password: _, ...result } = user;
    return result;
  }

  /**
   * login() - Gera JWT token para um usuário autenticado
   * 
   * Após validar as credenciais, este método gera um JWT token
   * que será usado para autenticar requisições futuras.
   * 
   * JWT PAYLOAD:
   * O payload contém informações que serão incluídas no token.
   * Essas informações podem ser lidas (mas não alteradas) por quem tem o token.
   * 
   * @param user - Usuário já validado (sem senha)
   * @returns Objeto com access_token e dados do usuário
   */
  async login(user: any) {
    /**
     * Payload do JWT - Dados que serão incluídos no token
     * 
     * - email: Email do usuário (para identificação)
     * - sub (subject): ID do usuário (padrão JWT)
     * - organizationId: ID da organização (multi-tenant)
     * - role: Role do usuário (SUPER_ADMIN ou USER)
     * 
     * IMPORTANTE: Não coloque informações sensíveis no payload!
     * O payload é apenas codificado em Base64, não criptografado.
     * Qualquer um pode decodificar e ler (mas não pode alterar sem a chave secreta).
     */
    const payload = {
      email: user.email,
      sub: user.id,
      organizationId: user.organizationId,
      role: user.role, // Role do USER (SUPER_ADMIN ou USER)
    };

    /**
     * jwtService.sign() - Gera o JWT token
     * 
     * Assina o payload com a chave secreta (JWT_SECRET).
     * O token resultante pode ser verificado usando a mesma chave.
     * 
     * Formato do token: header.payload.signature
     * Exemplo: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
     */
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  /**
   * register() - Registra um novo usuário no sistema
   * 
   * Este método cria um novo usuário e automaticamente cria um Employee
   * com role OWNER para o usuário registrado.
   * 
   * FLUXO:
   * 1. Verifica se o email já existe
   * 2. Hash da senha com bcrypt
   * 3. Cria o usuário no banco
   * 4. Cria um Employee com role OWNER
   * 5. Retorna o usuário criado
   * 
   * @param organizationId - ID da organização (multi-tenant)
   * @param email - Email do novo usuário
   * @param name - Nome do usuário
   * @param password - Senha em texto plano (será hasheada)
   * @returns Usuário criado
   * @throws BadRequestException se o email já existir
   */
  async register(organizationId: string, email: string, name: string, password: string): Promise<UserEntity> {
    /**
     * Verificar se o email já está em uso
     * 
     * Previne duplicação de emails na mesma organização.
     * Em um sistema multi-tenant, o mesmo email pode existir em organizações diferentes.
     */
    const existingUser = await this.usersRepository.findByEmail(organizationId, email);
    
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    /**
     * Hash da senha com bcrypt
     * 
     * bcrypt.hash():
     * - Gera um hash seguro da senha
     * - 10 é o "salt rounds" (número de iterações)
     *   - Maior = mais seguro, mas mais lento
     *   - 10 é um bom equilíbrio (recomendado)
     * 
     * IMPORTANTE: Nunca armazene senhas em texto plano!
     * Sempre use bcrypt ou outra função de hash segura.
     */
    const hashedPassword = await bcrypt.hash(password, 10);

    /**
     * Criar o usuário no banco de dados
     * 
     * status: UserStatus.ACTIVE - Usuário já fica ativo após registro
     * password: hashedPassword - Senha hasheada, não texto plano
     */
    const user = await this.usersRepository.create({
      organizationId,
      email,
      name,
      password: hashedPassword,
      status: UserStatus.ACTIVE,
    });

    /**
     * Criar Employee automaticamente para o usuário registrado
     * 
     * Quando um usuário se registra, ele automaticamente vira OWNER
     * da organização (primeiro usuário = dono).
     * 
     * Employee vs User:
     * - User: Conta de acesso ao sistema (email, senha)
     * - Employee: Relacionamento do usuário com uma organização
     * 
     * Um User pode ter múltiplos Employees (em organizações diferentes).
     */
    await this.employeesRepository.create({
      userId: user.id,
      organizationId,
      role: EmployeeRole.OWNER, // Primeiro usuário = dono
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
      // Verificar se o refresh token foi revogado (logout, troca de senha, etc)
      const isRevoked = await this.tokenBlacklistRepository.isBlacklisted(refreshToken);
      if (isRevoked) {
        this.logger.warn(`🚫 Refresh token blacklisted`);
        throw new UnauthorizedException('Invalid refresh token');
      }

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

