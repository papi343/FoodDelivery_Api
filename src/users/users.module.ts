import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UserRepository } from './domain/repositories/user.repository';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository';
import { GetProfileUseCase } from './application/use-cases/get-profile.use-case';
import { UsersController } from './presentation/http/users.controller';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [
    GetProfileUseCase,
    PrismaUserRepository,
    {
      provide: UserRepository,
      useExisting: PrismaUserRepository,
    },
  ],
  exports: [UserRepository],
})
export class UsersModule {}
