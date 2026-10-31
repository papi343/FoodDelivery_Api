import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository';

@Injectable()
export class GetProfileUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: number) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }
    return user.toPublic();
  }
}
