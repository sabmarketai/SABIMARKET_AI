import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { AiVoiceTransactionResponse } from 'src/ai/interfaces/ai-responses.interface';

import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(
    userId: string,
    dto: CreateTransactionDto,
  ) {
    return this.prisma.transactions.create({
      data: {
        user_id: userId,
        transaction_type: dto.transactionType,
        total_amount: dto.totalAmount,
        profit: dto.profit,
        note: dto.note,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.transactions.findMany({
      where: {
        user_id: userId,
      },
      include: {
        transaction_items: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async findOne(id: bigint) {
    const transaction =
      await this.prisma.transactions.findUnique({
        where: {
          id,
        },
        include: {
          transaction_items: true,
        },
      });

    if (!transaction) {
      throw new NotFoundException(
        'Transaction not found',
      );
    }

    return transaction;
  }

  async update(
    id: bigint,
    dto: UpdateTransactionDto,
  ) {
    return this.prisma.transactions.update({
      where: {
        id,
      },
      data: {
        transaction_type: dto.transactionType,
        total_amount: dto.totalAmount,
        profit: dto.profit,
        note: dto.note,
      },
    });
  }

  async remove(id: bigint) {
    return this.prisma.transactions.delete({
      where: {
        id,
      },
    });
  }

  /**
   * Persists the transactions parsed by the AI voice/extract-text endpoints.
   * Each entry in aiResponse.transactions becomes its own transaction row
   * (with one transaction_item), created atomically per entry.
   */
  async createFromAi(
    userId: string,
    aiResponse: AiVoiceTransactionResponse,
  ) {
    if (!aiResponse.transactions.length) {
      throw new BadRequestException(
        'No transactions were detected in the recording',
      );
    }

    const transactionDate = this.parseAiDate(aiResponse.date);

    const transactions = await this.prisma.$transaction(async (tx) => {
      const results: Array<
        Awaited<ReturnType<typeof tx.transactions.create>> & {
          transaction_items: Awaited<
            ReturnType<typeof tx.transaction_items.create>
          >[];
        }
      > = [];

      for (const entry of aiResponse.transactions) {
        const unitPrice =
          entry.quantity > 0 ? entry.amount / entry.quantity : entry.amount;

        const transaction = await tx.transactions.create({
          data: {
            user_id: userId,
            transaction_type: entry.action,
            transaction_date: transactionDate,
            total_amount: entry.amount,
            // currency: entry.currency,
            note: `Voice: "${aiResponse.transcript}"`,
          },
        });

        const item = await tx.transaction_items.create({
          data: {
            transaction_id: transaction.id,
            item_name: entry.item,
            quantity: entry.quantity,
            unit: entry.unit ?? null,
            unit_price: unitPrice,
            total_price: entry.amount,
          },
        });

        results.push({ ...transaction, transaction_items: [item] });
      }

      return results;
    });

    return {
      transcript: aiResponse.transcript,
      date: aiResponse.date,
      transactions,
    };
  }

  private parseAiDate(date: string): Date {
    const parsed = new Date(date);
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  }
}