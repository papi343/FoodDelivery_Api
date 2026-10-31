export class MenuItem {
  constructor(
    public readonly id: number | null,
    public restaurantId: number,
    public nom: string,
    public description: string | null = null,
    public prix: number,
    public disponible: boolean = true,
    public categorie: string,
    public readonly createdAt?: Date,
  ) {}
}
