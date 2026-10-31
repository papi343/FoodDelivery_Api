import { PaymentStatus } from '../../../common/enums/payment-status.enum';

export class Payment {
  constructor(
    public readonly id: number | null,
    public readonly orderId: number,
    public montant: number,
    public statut: PaymentStatus = PaymentStatus.PAYE,
    public methode: string,
    public transactionId: string,
    public readonly createdAt?: Date,
  ) {}
}
