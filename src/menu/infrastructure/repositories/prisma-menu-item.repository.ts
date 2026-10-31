import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { MenuItem } from '../../domain/entities/menu-item.entity';
import { MenuItemRepository } from '../../domain/repositories/menu-item.repository';

@Injectable()
export class PrismaMenuItemRepository extends MenuItemRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  private toDomain(record: {
    id: number;
    restaurantId: number;
    nom: string;
    description: string | null;
    prix: number;
    disponible: boolean;
    categorie: string;
    createdAt: Date;
  }): MenuItem {
    return new MenuItem(
      record.id,
      record.restaurantId,
      record.nom,
      record.description,
      record.prix,
      record.disponible,
      record.categorie,
      record.createdAt,
    );
  }

  async create(item: MenuItem): Promise<MenuItem> {
    const created = await this.prisma.menuItem.create({
      data: {
        restaurantId: item.restaurantId,
        nom: item.nom,
        description: item.description,
        prix: item.prix,
        disponible: item.disponible,
        categorie: item.categorie,
      },
    });
    return this.toDomain(created);
  }

  async findById(id: number): Promise<MenuItem | null> {
    const found = await this.prisma.menuItem.findUnique({ where: { id } });
    return found ? this.toDomain(found) : null;
  }

  async findByIds(ids: number[]): Promise<MenuItem[]> {
    const items = await this.prisma.menuItem.findMany({
      where: { id: { in: ids } },
    });
    return items.map((i) => this.toDomain(i));
  }

  async findByRestaurantId(restaurantId: number): Promise<MenuItem[]> {
    const items = await this.prisma.menuItem.findMany({
      where: { restaurantId },
      orderBy: { categorie: 'asc' },
    });
    return items.map((i) => this.toDomain(i));
  }

  async update(
    id: number,
    data: Partial<
      Pick<MenuItem, 'nom' | 'description' | 'prix' | 'disponible' | 'categorie'>
    >,
  ): Promise<MenuItem> {
    const updated = await this.prisma.menuItem.update({
      where: { id },
      data,
    });
    return this.toDomain(updated);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.menuItem.delete({ where: { id } });
  }
}
