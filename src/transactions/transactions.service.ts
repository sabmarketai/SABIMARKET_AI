import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';

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
}