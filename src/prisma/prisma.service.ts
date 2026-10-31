import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// Service Prisma pour gérer la connexion à la base de données
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  // Connexion automatique au démarrage du module
  async onModuleInit() {
    await this.$connect();
  }

  // Fermeture propre de la connexion à l'arrêt de l'application
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
