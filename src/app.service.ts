import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return {
      name: 'FoodDelivery API',
      version: '1.0.0',
      architecture: 'Domain-Driven Design (DDD)',
      status: 'running',
    };
  }
}
