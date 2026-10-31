import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { User } from '../../../users/domain/entities/user.entity';
import { Role } from '../../../common/enums/role.enum';

// Use case pour l'inscription d'un nouvel utilisateur
@Injectable()
export class RegisterUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async execute(input: {
    nom: string;
    email: string;
    password: string;
    role?: Role;
  }) {
    // Vérifie si l'email est déjà utilisé
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictException('Un compte existe déjà avec cet email');
    }

    // Hashage du mot de passe avant sauvegarde
    const motDePasseHash = await bcrypt.hash(input.password, 10);
    const userToCreate = new User(
      null,
      input.nom,
      input.email,
      motDePasseHash,
      input.role ?? Role.CLIENT,
    );

    const createdUser = await this.userRepository.create(userToCreate);

    const payload = {
      sub: createdUser.id!,
      email: createdUser.email,
      role: createdUser.role,
    };

    // Génération de l'access token et du refresh token
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret:
        this.configService.get<string>('JWT_REFRESH_SECRET') ||
        'food_delivery_jwt_refresh_secret_key_2026',
      expiresIn: '7d',
    });

    // On stocke le hash du refresh token en base
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.userRepository.updateRefreshToken(
      createdUser.id!,
      refreshTokenHash,
    );

    return {
      user: createdUser.toPublic(),
      accessToken,
      refreshToken,
    };
  }
}
