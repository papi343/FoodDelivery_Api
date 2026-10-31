import { User } from '../entities/user.entity';
import { Role } from '../../../common/enums/role.enum';

// Contrat du repository User (couche domaine)
export abstract class UserRepository {
  abstract create(user: User): Promise<User>;
  abstract findById(id: number): Promise<User | null>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findAll(): Promise<User[]>;
  abstract updateRefreshToken(
    userId: number,
    refreshTokenHash: string | null,
  ): Promise<void>;
  abstract updateRole(userId: number, role: Role): Promise<User>;
  abstract delete(userId: number): Promise<void>;
}
