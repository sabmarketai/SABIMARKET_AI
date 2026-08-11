import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TransactionItemsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(transactionId: bigint, userId: string) {
    const transaction = await this.prisma.transactions.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.user_id !== userId) {
      throw new ForbiddenException(
        'You do not have access to this transaction',
      );
    }

    return this.prisma.transaction_items.findMany({
      where: {
        transaction_id: transactionId,
      },
    });
  }
}
