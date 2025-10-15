import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Patch,
  Req,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
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
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    this.logger.log(`📝 Register attempt - Email: ${registerDto.email}`);
    
    try {
      const result = await this.authService.register(registerDto);
      this.logger.log(`✅ User registered successfully - Email: ${registerDto.email}, UserID: ${result.user.id}`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Register failed - Email: ${registerDto.email}, Error: ${error.message}`);
      throw error;
    }
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    this.logger.log(`🔑 Login attempt - Email: ${loginDto.email}`);
    
    try {
      const result = await this.authService.login(loginDto);
      this.logger.log(`✅ Login successful - Email: ${loginDto.email}, UserID: ${result.user.id}`);
      return result;
    } catch (error) {
      this.logger.warn(`⚠️  Login failed - Email: ${loginDto.email}, Reason: ${error.message}`);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser() user: any,
    @Req() request: Request,
  ): Promise<{ message: string }> {
    this.logger.log(`🚪 Logout attempt - UserID: ${user.userId}`);
    
    try {
      // Extrair token do header
      const token = this.extractTokenFromHeader(request);
      
      await this.authService.logout(user.userId, token);
      
      this.logger.log(`✅ Logout successful - UserID: ${user.userId}, Token added to blacklist`);
      return { message: 'Logout successful' };
    } catch (error) {
      this.logger.error(`❌ Logout failed - UserID: ${user.userId}, Error: ${error.message}`);
      throw error;
    }
  }

  private extractTokenFromHeader(request: Request): string {
    const authorization = request.headers.authorization;
    if (!authorization) {
      return '';
    }

    const [type, token] = authorization.split(' ');
    return type === 'Bearer' ? token : '';
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<AuthResponseDto> {
    this.logger.log(`🔄 Refresh token attempt`);
    
    try {
      const result = await this.authService.refreshToken(refreshTokenDto.refreshToken);
      this.logger.log(`✅ Token refreshed successfully - UserID: ${result.user.id}`);
      return result;
    } catch (error) {
      this.logger.warn(`⚠️  Refresh token failed - Reason: ${error.message}`);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getProfile(@CurrentUser() user: any) {
    this.logger.log(`👤 Get profile - UserID: ${user.userId}`);
    
    try {
      const result = await this.authService.getProfile(user.userId);
      this.logger.log(`✅ Profile retrieved - Email: ${result.email}`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Get profile failed - UserID: ${user.userId}, Error: ${error.message}`);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser() user: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    this.logger.log(`🔐 Change password attempt - UserID: ${user.userId}`);
    
    try {
      await this.authService.changePassword(
        user.userId,
        changePasswordDto.currentPassword,
        changePasswordDto.newPassword,
      );
      
      this.logger.log(`✅ Password changed successfully - UserID: ${user.userId}`);
      return { message: 'Password changed successfully' };
    } catch (error) {
      this.logger.warn(`⚠️  Change password failed - UserID: ${user.userId}, Reason: ${error.message}`);
      throw error;
    }
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    this.logger.log(`📧 Forgot password request - Email: ${forgotPasswordDto.email}`);
    
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
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    this.logger.log(`🔓 Reset password attempt with token`);
    
    try {
      const result = await this.authService.resetPassword(
        resetPasswordDto.token,
        resetPasswordDto.newPassword,
      );
      
      this.logger.log(`✅ Password reset successful`);
      return result;
    } catch (error) {
      this.logger.warn(`⚠️  Reset password failed - Reason: ${error.message}`);
      throw error;
    }
  }
}

