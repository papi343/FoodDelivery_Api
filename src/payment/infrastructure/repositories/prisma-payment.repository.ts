import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Payment } from '../../domain/entities/payment.entity';
import { PaymentRepository } from '../../domain/repositories/payment.repository';
import { PaymentStatus } from '../../../common/enums/payment-status.enum';

@Injectable()
export class PrismaPaymentRepository extends PaymentRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  private toDomain(record: {
    id: number;
    orderId: number;
    montant: number;
    statut: string;
    methode: string;
    transactionId: string;
    createdAt: Date;
  }): Payment {
    return new Payment(
      record.id,
      record.orderId,
      record.montant,
      record.statut as PaymentStatus,
      record.methode,
      record.transactionId,
      record.createdAt,
    );
  }

  async create(payment: Payment): Promise<Payment> {
    const created = await this.prisma.payment.create({
      data: {
        orderId: payment.orderId,
        montant: payment.montant,
        statut: payment.statut,
        methode: payment.methode,
        transactionId: payment.transactionId,
      },
    });
    return this.toDomain(created);
  }

  async findByOrderId(orderId: number): Promise<Payment | null> {
    const found = await this.prisma.payment.findUnique({
      where: { orderId },
    });
    return found ? this.toDomain(found) : null;
  }

  async updateStatus(id: number, statut: PaymentStatus): Promise<Payment> {
    const updated = await this.prisma.payment.update({
      where: { id },
      data: { statut },
    });
    return this.toDomain(updated);
  }
}
