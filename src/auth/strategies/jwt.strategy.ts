import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { EmployeesRepository } from '../../employees/repositories/employees.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly employeesRepository: EmployeesRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  async validate(payload: any) {
    const user = await this.authService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }

    // Buscar employee associado ao user (se existir)
    const employee = await this.employeesRepository.findByUserId(user.id);

    return {
      id: user.id,
      userId: user.id,
      email: user.email,
      name: user.name,
      organizationId: user.organizationId,
      role: user.role, // Role do USER (SUPER_ADMIN ou USER)
      employee: employee ? {
        id: employee.id,
        role: employee.role, // Role do EMPLOYEE (OWNER, ADMIN, STAFF, VIEWER)
        active: employee.active,
      } : null,
    };
  }
}

