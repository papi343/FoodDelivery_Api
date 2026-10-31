export class OrderItem {
  constructor(
    public readonly id: number | null,
    public readonly orderId: number | null,
    public readonly menuItemId: number,
    public quantite: number,
    public prixUnitaire: number,
    public readonly nomPlat?: string,
  ) {}

  get sousTotal(): number {
    return Number((this.quantite * this.prixUnitaire).toFixed(2));
  }
}
