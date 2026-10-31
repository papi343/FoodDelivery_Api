import { Payment } from '../entities/payment.entity';
import { PaymentStatus } from '../../../common/enums/payment-status.enum';

export abstract class PaymentRepository {
  abstract create(payment: Payment): Promise<Payment>;
  abstract findByOrderId(orderId: number): Promise<Payment | null>;
  abstract updateStatus(id: number, statut: PaymentStatus): Promise<Payment>;
}
