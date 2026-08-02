import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';

import { CreateTransactionItemDto } from './dto/create-transaction-item.dto';
import { UpdateTransactionItemDto } from './dto/update-transaction-item.dto';

@Injectable()
export class TransactionItemsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(
    transactionId: bigint,
    dto: CreateTransactionItemDto,
  ) {
    return this.prisma.transaction_items.create({
      data: {
        transaction_id: transactionId,
        item_name: dto.itemName,
        quantity: dto.quantity,
        unit: dto.unit,
        unit_price: dto.unitPrice,
        total_price:
          dto.quantity * dto.unitPrice,
      },
    });
  }

  async findAll(transactionId: bigint) {
    return this.prisma.transaction_items.findMany({
      where: {
        transaction_id: transactionId,
      },
    });
  }

  async findOne(id: bigint) {
    const item =
      await this.prisma.transaction_items.findUnique({
        where: {
          id,
        },
      });

    if (!item) {
      throw new NotFoundException(
        'Transaction item not found',
      );
    }

    return item;
  }

  async update(
    id: bigint,
    dto: UpdateTransactionItemDto,
  ) {
    const existing =
      await this.prisma.transaction_items.findUnique({
        where: {
          id,
        },
      });

    if (!existing) {
      throw new NotFoundException(
        'Transaction item not found',
      );
    }

    const quantity =
      dto.quantity ??
      Number(existing.quantity);

    const unitPrice =
      dto.unitPrice ??
      Number(existing.unit_price);

    return this.prisma.transaction_items.update({
      where: {
        id,
      },
      data: {
        item_name: dto.itemName,
        quantity,
        unit: dto.unit,
        unit_price: unitPrice,
        total_price:
          quantity * unitPrice,
      },
    });
  }

  async remove(id: bigint) {
    return this.prisma.transaction_items.delete({
      where: {
        id,
      },
    });
  }
}