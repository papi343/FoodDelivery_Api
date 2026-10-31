import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../../../users/domain/repositories/user.repository';

// Use case pour la connexion utilisateur
@Injectable()
export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async execute(email: string, password: string) {
    // Recherche de l'utilisateur par email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Comparaison du mot de passe avec le hash stocké
    const passwordValid = await bcrypt.compare(password, user.motDePasseHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const payload = {
      sub: user.id!,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret:
        this.configService.get<string>('JWT_REFRESH_SECRET') ||
        'food_delivery_jwt_refresh_secret_key_2026',
      expiresIn: '7d',
    });

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.userRepository.updateRefreshToken(user.id!, refreshTokenHash);

    return {
      user: user.toPublic(),
      accessToken,
      refreshToken,
    };
  }
}
