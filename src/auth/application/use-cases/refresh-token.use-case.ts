import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../../../users/domain/repositories/user.repository';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async execute(refreshToken: string) {
    try {
      const secret =
        this.configService.get<string>('JWT_REFRESH_SECRET') ||
        'food_delivery_jwt_refresh_secret_key_2026';

      const payload = await this.jwtService.verifyAsync<{
        sub: number;
        email: string;
        role: string;
      }>(refreshToken, { secret });

      const user = await this.userRepository.findById(payload.sub);
      if (!user || !user.refreshTokenHash) {
        throw new UnauthorizedException('Refresh token invalide');
      }

      const tokenMatches = await bcrypt.compare(
        refreshToken,
        user.refreshTokenHash,
      );
      if (!tokenMatches) {
        throw new UnauthorizedException('Refresh token invalide');
      }

      const newPayload = {
        sub: user.id!,
        email: user.email,
        role: user.role,
      };

      const newAccessToken = await this.jwtService.signAsync(newPayload);
      const newRefreshToken = await this.jwtService.signAsync(newPayload, {
        secret,
        expiresIn: '7d',
      });

      const newRefreshTokenHash = await bcrypt.hash(newRefreshToken, 10);
      await this.userRepository.updateRefreshToken(
        user.id!,
        newRefreshTokenHash,
      );

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch {
      throw new UnauthorizedException('Refresh token invalide ou expiré');
    }
  }
}
