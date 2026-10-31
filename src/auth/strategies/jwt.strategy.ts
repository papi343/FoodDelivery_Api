import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Role } from '../../common/enums/role.enum';

export interface JwtPayload {
  sub: number;
  email: string;
  role: Role;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') ||
        'food_delivery_jwt_access_secret_key_2026',
    });
  }

  validate(payload: JwtPayload) {
    return {
      id: payload.sub,
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
