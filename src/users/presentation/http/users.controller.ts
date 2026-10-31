import { Controller, Get, UseGuards } from '@nestjs/common';
import { GetProfileUseCase } from '../../application/use-cases/get-profile.use-case';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly getProfileUseCase: GetProfileUseCase) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser('id') userId: number) {
    return this.getProfileUseCase.execute(userId);
  }
}
