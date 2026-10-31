export class Notification {
  constructor(
    public readonly id: number | null,
    public readonly userId: number,
    public type: string,
    public message: string,
    public lu: boolean = false,
    public readonly createdAt?: Date,
  ) {}
}
