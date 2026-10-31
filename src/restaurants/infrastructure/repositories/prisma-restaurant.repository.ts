import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  Restaurant,
  RestaurantMenuItemSummary,
} from '../../domain/entities/restaurant.entity';
import { RestaurantRepository } from '../../domain/repositories/restaurant.repository';

@Injectable()
export class PrismaRestaurantRepository extends RestaurantRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  private toDomain(record: {
    id: number;
    nom: string;
    adresse: string;
    ownerId: number;
    estOuvert: boolean;
    horaires: string | null;
    note: number;
    createdAt: Date;
    menuItems?: RestaurantMenuItemSummary[];
  }): Restaurant {
    return new Restaurant(
      record.id,
      record.nom,
      record.adresse,
      record.ownerId,
      record.estOuvert,
      record.horaires,
      record.note,
      record.createdAt,
      record.menuItems,
    );
  }

  async create(restaurant: Restaurant): Promise<Restaurant> {
    const created = await this.prisma.restaurant.create({
      data: {
        nom: restaurant.nom,
        adresse: restaurant.adresse,
        ownerId: restaurant.ownerId,
        estOuvert: restaurant.estOuvert,
        horaires: restaurant.horaires,
        note: restaurant.note,
      },
    });
    return this.toDomain(created);
  }

  async findAll(): Promise<Restaurant[]> {
    const list = await this.prisma.restaurant.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return list.map((r) => this.toDomain(r));
  }

  async findById(id: number): Promise<Restaurant | null> {
    const found = await this.prisma.restaurant.findUnique({
      where: { id },
      include: {
        menuItems: {
          orderBy: { categorie: 'asc' },
        },
      },
    });
    return found ? this.toDomain(found) : null;
  }

  async findByOwnerId(ownerId: number): Promise<Restaurant[]> {
    const list = await this.prisma.restaurant.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
    });
    return list.map((r) => this.toDomain(r));
  }

  async update(
    id: number,
    data: Partial<
      Pick<Restaurant, 'nom' | 'adresse' | 'estOuvert' | 'horaires' | 'note'>
    >,
  ): Promise<Restaurant> {
    const updated = await this.prisma.restaurant.update({
      where: { id },
      data,
    });
    return this.toDomain(updated);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.restaurant.delete({ where: { id } });
  }
}
