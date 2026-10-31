import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// Module global pour éviter d'avoir à réimporter Prisma partout
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
