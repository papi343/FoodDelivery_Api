import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { User } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/repositories/user.repository';
import { Role } from '../../../common/enums/role.enum';

// Implémentation Prisma du repository User
@Injectable()
export class PrismaUserRepository extends UserRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  // Convertit l'enregistrement Prisma vers notre entité domaine User
  private toDomain(record: {
    id: number;
    nom: string;
    email: string;
    motDePasseHash: string;
    role: string;
    refreshTokenHash: string | null;
    createdAt: Date;
  }): User {
    return new User(
      record.id,
      record.nom,
      record.email,
      record.motDePasseHash,
      record.role as Role,
      record.refreshTokenHash,
      record.createdAt,
    );
  }

  async create(user: User): Promise<User> {
    const created = await this.prisma.user.create({
      data: {
        nom: user.nom,
        email: user.email,
        motDePasseHash: user.motDePasseHash,
        role: user.role,
        refreshTokenHash: user.refreshTokenHash,
      },
    });
    return this.toDomain(created);
  }

  async findById(id: number): Promise<User | null> {
    const found = await this.prisma.user.findUnique({ where: { id } });
    return found ? this.toDomain(found) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const found = await this.prisma.user.findUnique({ where: { email } });
    return found ? this.toDomain(found) : null;
  }

  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return users.map((u) => this.toDomain(u));
  }

  async updateRefreshToken(
    userId: number,
    refreshTokenHash: string | null,
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash },
    });
  }

  async updateRole(userId: number, role: Role): Promise<User> {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { role },
    });
    return this.toDomain(updated);
  }

  async delete(userId: number): Promise<void> {
    await this.prisma.user.delete({ where: { id: userId } });
  }
}
