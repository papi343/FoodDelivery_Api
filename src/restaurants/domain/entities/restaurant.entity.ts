export interface RestaurantMenuItemSummary {
  id: number;
  nom: string;
  description: string | null;
  prix: number;
  disponible: boolean;
  categorie: string;
}

export class Restaurant {
  constructor(
    public readonly id: number | null,
    public nom: string,
    public adresse: string,
    public ownerId: number,
    public estOuvert: boolean = true,
    public horaires: string | null = null,
    public note: number = 0,
    public readonly createdAt?: Date,
    public readonly menuItems?: RestaurantMenuItemSummary[],
  ) {}
}
