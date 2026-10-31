export class DashboardStats {
  constructor(
    public readonly totalUsers: number,
    public readonly totalRestaurants: number,
    public readonly totalOrders: number,
    public readonly chiffreAffairesTotal: number,
    public readonly ordersByStatus: Record<string, number>,
    public readonly usersByRole: Record<string, number>,
  ) {}
}
