import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { Role } from '../../../common/enums/role.enum';

@Injectable()
export class ManageUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async findAll() {
    const users = await this.userRepository.findAll();
    return users.map((u) => u.toPublic());
  }

  async updateRole(userId: number, role: Role) {
    const existing = await this.userRepository.findById(userId);
    if (!existing) {
      throw new NotFoundException(`Utilisateur #${userId} introuvable`);
    }
    const updated = await this.userRepository.updateRole(userId, role);
    return updated.toPublic();
  }

  async deleteUser(userId: number) {
    const existing = await this.userRepository.findById(userId);
    if (!existing) {
      throw new NotFoundException(`Utilisateur #${userId} introuvable`);
    }
    await this.userRepository.delete(userId);
    return { message: `Utilisateur #${userId} supprimé avec succès` };
  }
}
