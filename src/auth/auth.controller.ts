import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Logger,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    this.logger.log(`📝 Register attempt - Email: ${registerDto.email}`);
    
    try {
      // Assumir organizationId fixo para simplificar (TODO: pegar do contexto/header)
      const organizationId = '00000000-0000-0000-0000-000000000001'; 
      
      const user = await this.authService.register(
        organizationId,
        registerDto.email,
        registerDto.name,
        registerDto.password,
      );
      
      this.logger.log(`✅ User registered successfully - Email: ${registerDto.email}, UserID: ${user.id}`);
      
      // Fazer login automático após registro
      const loginResult = await this.authService.login(user);
      return loginResult;
    } catch (error) {
      this.logger.error(`❌ Register failed - Email: ${registerDto.email}, Error: ${error.message}`);
      throw error;
    }
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    this.logger.log(`🔐 Login attempt - Email: ${loginDto.email}`);
    
    try {
      // Login busca o usuário pelo email globalmente (email é único)
      const user = await this.authService.validateUser(
        loginDto.email,
        loginDto.password,
      );
      
      const result = await this.authService.login(user);
      this.logger.log(`✅ Login successful - Email: ${loginDto.email}, UserID: ${user.id}`);
      
      return result;
    } catch (error) {
      this.logger.error(`❌ Login failed - Email: ${loginDto.email}, Error: ${error.message}`);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getProfile(@CurrentUser() user: any) {
    this.logger.log(`👤 Profile request - UserID: ${user.id}`);
    
    const userProfile = await this.authService.findById(user.id);
    
    if (!userProfile) {
      this.logger.warn(`⚠️  Profile not found - UserID: ${user.id}`);
      throw new Error('User not found');
    }
    
    this.logger.log(`✅ Profile retrieved - UserID: ${user.id}`);
    return userProfile;
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    this.logger.log(`🔐 Forgot password request - Email: ${forgotPasswordDto.email}`);
    
    try {
      const result = await this.authService.forgotPassword(forgotPasswordDto.email);
      this.logger.log(`✅ Forgot password processed - Email: ${forgotPasswordDto.email}`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Forgot password failed - Email: ${forgotPasswordDto.email}, Error: ${error.message}`);
      throw error;
    }
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    this.logger.log(`🔐 Reset password request - Token: ${resetPasswordDto.token.substring(0, 8)}...`);
    
    try {
      const result = await this.authService.resetPassword(
        resetPasswordDto.token,
        resetPasswordDto.newPassword,
      );
      this.logger.log(`✅ Password reset successful`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Reset password failed - Error: ${error.message}`);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser() user: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    this.logger.log(`🔐 Change password request - UserID: ${user.id}`);
    
    try {
      const result = await this.authService.changePassword(
        user.id,
        changePasswordDto.currentPassword,
        changePasswordDto.newPassword,
      );
      this.logger.log(`✅ Password changed - UserID: ${user.id}`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Change password failed - UserID: ${user.id}, Error: ${error.message}`);
      throw error;
    }
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    this.logger.log(`🔄 Refresh token request`);
    
    try {
      const result = await this.authService.refreshToken(refreshTokenDto.refreshToken);
      this.logger.log(`✅ Token refreshed successfully`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Refresh token failed - Error: ${error.message}`);
      throw error;
    }
  }
}


