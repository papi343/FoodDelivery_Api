import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateOrderUseCase } from './create-order.use-case';
import { UpdateOrderUseCase } from './update-order.use-case';
import { CancelOrderUseCase } from './cancel-order.use-case';
import { OrderRepository } from '../../domain/repositories/order.repository';
import { RestaurantRepository } from '../../../restaurants/domain/repositories/restaurant.repository';
import { MenuItemRepository } from '../../../menu/domain/repositories/menu-item.repository';
import { Restaurant } from '../../../restaurants/domain/entities/restaurant.entity';
import { MenuItem } from '../../../menu/domain/entities/menu-item.entity';
import { Order } from '../../domain/entities/order.entity';
import { OrderItem } from '../../domain/entities/order-item.entity';
import { OrderStatus } from '../../../common/enums/order-status.enum';
import { Role } from '../../../common/enums/role.enum';

describe('Orders Use Cases (DDD)', () => {
  let orderRepository: jest.Mocked<OrderRepository>;
  let restaurantRepository: jest.Mocked<RestaurantRepository>;
  let menuItemRepository: jest.Mocked<MenuItemRepository>;
  let eventEmitter: jest.Mocked<EventEmitter2>;
  let createOrderUseCase: CreateOrderUseCase;
  let updateOrderUseCase: UpdateOrderUseCase;
  let cancelOrderUseCase: CancelOrderUseCase;

  beforeEach(() => {
    orderRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByClientId: jest.fn(),
      findByRestaurantId: jest.fn(),
      findAll: jest.fn(),
      updateOrderDetails: jest.fn(),
      updateStatus: jest.fn(),
    } as unknown as jest.Mocked<OrderRepository>;

    restaurantRepository = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<RestaurantRepository>;

    menuItemRepository = {
      findByIds: jest.fn(),
    } as unknown as jest.Mocked<MenuItemRepository>;

    eventEmitter = {
      emit: jest.fn(),
    } as unknown as jest.Mocked<EventEmitter2>;

    createOrderUseCase = new CreateOrderUseCase(
      orderRepository,
      restaurantRepository,
      menuItemRepository,
      eventEmitter,
    );
    updateOrderUseCase = new UpdateOrderUseCase(
      orderRepository,
      menuItemRepository,
    );
    cancelOrderUseCase = new CancelOrderUseCase(
      orderRepository,
      restaurantRepository,
      eventEmitter,
    );
  });

  describe('CreateOrderUseCase', () => {
    it('should calculate total, create order, and emit restaurant.newOrder event', async () => {
      restaurantRepository.findById.mockResolvedValue(
        new Restaurant(10, 'Chez Luigi', '12 Rue de Paris', 5, true),
      );
      menuItemRepository.findByIds.mockResolvedValue([
        new MenuItem(100, 10, 'Pizza Margherita', 'Classique', 12.5, true, 'Pizzas'),
      ]);
      orderRepository.create.mockImplementation(async (order: Order) => {
        return new Order(
          1,
          order.clientId,
          order.restaurantId,
          order.items,
          order.statut,
          order.total,
          order.adresseLivraison,
        );
      });

      const created = await createOrderUseCase.execute(99, {
        restaurantId: 10,
        adresseLivraison: '25 Avenue Victor Hugo',
        items: [{ menuItemId: 100, quantite: 2 }],
      });

      expect(created.id).toBe(1);
      expect(created.total).toBe(25);
      expect(created.statut).toBe(OrderStatus.EN_ATTENTE);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'restaurant.newOrder',
        expect.objectContaining({ restaurantOwnerId: 5 }),
      );
    });

    it('should reject order if restaurant is closed', async () => {
      restaurantRepository.findById.mockResolvedValue(
        new Restaurant(10, 'Chez Luigi', '12 Rue de Paris', 5, false),
      );

      await expect(
        createOrderUseCase.execute(99, {
          restaurantId: 10,
          adresseLivraison: '25 Avenue Victor Hugo',
          items: [{ menuItemId: 100, quantite: 1 }],
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('UpdateOrderUseCase', () => {
    it('should block client modification once order is EN_PREPARATION', async () => {
      orderRepository.findById.mockResolvedValue(
        new Order(
          1,
          99,
          10,
          [new OrderItem(1, 1, 100, 1, 12.5)],
          OrderStatus.EN_PREPARATION,
          12.5,
          '25 Avenue Victor Hugo',
        ),
      );

      await expect(
        updateOrderUseCase.execute(1, 99, {
          adresseLivraison: 'Nouvelle adresse',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('CancelOrderUseCase', () => {
    it('should cancel an EN_ATTENTE order and emit order.statusChanged', async () => {
      const existingOrder = new Order(
        1,
        99,
        10,
        [new OrderItem(1, 1, 100, 1, 12.5)],
        OrderStatus.EN_ATTENTE,
        12.5,
        '25 Avenue Victor Hugo',
      );
      orderRepository.findById.mockResolvedValue(existingOrder);
      orderRepository.updateStatus.mockResolvedValue(
        new Order(
          1,
          99,
          10,
          existingOrder.items,
          OrderStatus.ANNULEE,
          12.5,
          '25 Avenue Victor Hugo',
        ),
      );

      const cancelled = await cancelOrderUseCase.execute(1, {
        id: 99,
        role: Role.CLIENT,
      });

      expect(cancelled.statut).toBe(OrderStatus.ANNULEE);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'order.statusChanged',
        expect.anything(),
      );
    });

    it('should forbid a client from cancelling another client’s order', async () => {
      orderRepository.findById.mockResolvedValue(
        new Order(
          1,
          99,
          10,
          [new OrderItem(1, 1, 100, 1, 12.5)],
          OrderStatus.EN_ATTENTE,
          12.5,
          '25 Avenue Victor Hugo',
        ),
      );

      await expect(
        cancelOrderUseCase.execute(1, { id: 777, role: Role.CLIENT }),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
