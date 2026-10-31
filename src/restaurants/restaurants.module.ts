import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RestaurantRepository } from './domain/repositories/restaurant.repository';
import { PrismaRestaurantRepository } from './infrastructure/repositories/prisma-restaurant.repository';
import { CreateRestaurantUseCase } from './application/use-cases/create-restaurant.use-case';
import { FindAllRestaurantsUseCase } from './application/use-cases/find-all-restaurants.use-case';
import { FindRestaurantByIdUseCase } from './application/use-cases/find-restaurant-by-id.use-case';
import { UpdateRestaurantUseCase } from './application/use-cases/update-restaurant.use-case';
import { DeleteRestaurantUseCase } from './application/use-cases/delete-restaurant.use-case';
import { RestaurantsController } from './presentation/http/restaurants.controller';

@Module({
  imports: [PrismaModule],
  controllers: [RestaurantsController],
  providers: [
    CreateRestaurantUseCase,
    FindAllRestaurantsUseCase,
    FindRestaurantByIdUseCase,
    UpdateRestaurantUseCase,
    DeleteRestaurantUseCase,
    PrismaRestaurantRepository,
    {
      provide: RestaurantRepository,
      useExisting: PrismaRestaurantRepository,
    },
  ],
  exports: [RestaurantRepository],
})
export class RestaurantsModule {}
