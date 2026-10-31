import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { RegisterUseCase } from './register.use-case';
import { LoginUseCase } from './login.use-case';
import { RefreshTokenUseCase } from './refresh-token.use-case';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { User } from '../../../users/domain/entities/user.entity';
import { Role } from '../../../common/enums/role.enum';

describe('Auth Use Cases (DDD)', () => {
  let userRepository: jest.Mocked<UserRepository>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;
  let registerUseCase: RegisterUseCase;
  let loginUseCase: LoginUseCase;
  let refreshTokenUseCase: RefreshTokenUseCase;

  beforeEach(() => {
    userRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
      updateRefreshToken: jest.fn(),
      updateRole: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    jwtService = {
      signAsync: jest.fn().mockResolvedValue('mock-jwt-token'),
      verifyAsync: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;

    configService = {
      get: jest.fn().mockReturnValue('test-secret'),
    } as unknown as jest.Mocked<ConfigService>;

    registerUseCase = new RegisterUseCase(
      userRepository,
      jwtService,
      configService,
    );
    loginUseCase = new LoginUseCase(userRepository, jwtService, configService);
    refreshTokenUseCase = new RefreshTokenUseCase(
      userRepository,
      jwtService,
      configService,
    );
  });

  describe('RegisterUseCase', () => {
    it('should register a new user and return access + refresh tokens', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockImplementation(async (u: User) => {
        return new User(1, u.nom, u.email, u.motDePasseHash, u.role);
      });

      const result = await registerUseCase.execute({
        nom: 'Alice',
        email: 'alice@test.com',
        password: 'password123',
        role: Role.CLIENT,
      });

      expect(result.user.id).toBe(1);
      expect(result.user.email).toBe('alice@test.com');
      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.refreshToken).toBe('mock-jwt-token');
      expect(userRepository.updateRefreshToken).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      userRepository.findByEmail.mockResolvedValue(
        new User(1, 'Alice', 'alice@test.com', 'hash', Role.CLIENT),
      );

      await expect(
        registerUseCase.execute({
          nom: 'Alice',
          email: 'alice@test.com',
          password: 'password123',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('LoginUseCase', () => {
    it('should authenticate valid credentials and return tokens', async () => {
      const hash = await bcrypt.hash('secret123', 4);
      userRepository.findByEmail.mockResolvedValue(
        new User(2, 'Bob', 'bob@test.com', hash, Role.RESTAURANT),
      );

      const result = await loginUseCase.execute('bob@test.com', 'secret123');
      expect(result.user.email).toBe('bob@test.com');
      expect(result.user.role).toBe(Role.RESTAURANT);
      expect(result.accessToken).toBe('mock-jwt-token');
    });

    it('should throw UnauthorizedException on invalid password', async () => {
      const hash = await bcrypt.hash('secret123', 4);
      userRepository.findByEmail.mockResolvedValue(
        new User(2, 'Bob', 'bob@test.com', hash, Role.CLIENT),
      );

      await expect(
        loginUseCase.execute('bob@test.com', 'wrongpass'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('RefreshTokenUseCase', () => {
    it('should issue new tokens when refresh token is valid', async () => {
      const rawRefresh = 'valid-refresh-token';
      const refreshHash = await bcrypt.hash(rawRefresh, 4);
      jwtService.verifyAsync.mockResolvedValue({
        sub: 1,
        email: 'alice@test.com',
        role: Role.CLIENT,
      });
      userRepository.findById.mockResolvedValue(
        new User(1, 'Alice', 'alice@test.com', 'pwdHash', Role.CLIENT, refreshHash),
      );

      const result = await refreshTokenUseCase.execute(rawRefresh);
      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.refreshToken).toBe('mock-jwt-token');
    });
  });
});
