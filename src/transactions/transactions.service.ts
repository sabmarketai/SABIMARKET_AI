import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from 'src/prisma/prisma.service';
import { AiVoiceTransactionResponse } from 'src/ai/interfaces/ai-responses.interface';

import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

const BUY_TYPES = new Set(['buy']);
const SELL_TYPES = new Set(['sell']);

function normalizeItemName(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) { }

  async create(userId: string, dto: CreateTransactionDto) {
    const type = dto.transactionType.trim().toLowerCase();

    return this.prisma.$transaction(async (tx) => {
      const transaction = await tx.transactions.create({
        data: {
          user_id: userId,
          transaction_type: dto.transactionType,
          total_amount: dto.totalAmount,
          profit: dto.profit,
          currency: dto.currency,
          note: dto.note,
          synced: false,
        },
      });

      for (const itemDto of dto.items) {
        const itemName = normalizeItemName(itemDto.itemName);
        const unit = itemDto.unit.trim();

        await tx.transaction_items.create({
          data: {
            transaction_id: transaction.id,
            item_name: itemName,
            quantity: itemDto.quantity,
            unit,
            unit_price: itemDto.unitPrice,
            total_price: itemDto.quantity * itemDto.unitPrice,
          },
        });

        await this.syncInventoryForItem(tx, userId, type, {
          itemName,
          quantity: itemDto.quantity,
          unit,
          unitPrice: itemDto.unitPrice,
        });
      }

      return tx.transactions.update({
        where: { id: transaction.id },
        data: { synced: true },
        include: { transaction_items: true },
      });
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

  async findOne(id: bigint, userId: string) {
    const transaction = await this.assertOwnership(id, userId);

    return this.prisma.transactions.findUnique({
      where: { id: transaction.id },
      include: { transaction_items: true },
    });
  }

  async update(id: bigint, userId: string, dto: UpdateTransactionDto) {
    await this.assertOwnership(id, userId);

    return this.prisma.transactions.update({
      where: { id },
      data: {
        // // item_name: dto.itemName,
        // quantity: dto.quantity!,
        // unit: dto.unit!,
        // unit_price: dto.unitPrice!,
        // total_price: dto.quantity! * dto.unitPrice!,
        transaction_type: dto.transactionType,
        total_amount: dto.totalAmount,
        profit: dto.profit,
        currency: dto.currency,
        note: dto.note,
        synced: false,
      },
    });
  }

  async remove(id: bigint, userId: string) {
    await this.assertOwnership(id, userId);

    return this.prisma.transactions.delete({
      where: { id },
    });
  }

  /**
   * Backfills inventory sync for a transaction that was created before this
   * transaction had a chance to sync (or via a path that doesn't sync, e.g.
   * legacy data). Guarded by the `synced` flag so it can't double-apply.
   */
  async syncTransactionInventory(id: bigint, userId: string) {
    const transaction = await this.assertOwnership(id, userId);

    if (transaction.synced) {
      return {
        message: 'Transaction already synced',
        transaction,
      };
    }

    const type = (transaction.transaction_type ?? '').trim().toLowerCase();

    const items = await this.prisma.transaction_items.findMany({
      where: { transaction_id: id },
    });

    return this.prisma.$transaction(async (tx) => {
      for (const item of items) {
        await this.syncInventoryForItem(tx, userId, type, {
          itemName: normalizeItemName(item.item_name ?? ''),
          quantity: Number(item.quantity ?? 0),
          unit: (item.unit ?? '').trim(),
          unitPrice: Number(item.unit_price ?? 0),
        });
      }

      return tx.transactions.update({
        where: { id },
        data: { synced: true },
        include: { transaction_items: true },
      });
    });
  }

  /**
   * Persists the transactions parsed by the AI voice/extract-text endpoints.
   * Each entry in aiResponse.transactions becomes its own transaction row
   * (with one transaction_item), created atomically per entry, and synced
   * to inventory the same way a manually-created buy/sell transaction is.
   */
  async createFromAi(userId: string, aiResponse: AiVoiceTransactionResponse) {
    if (!aiResponse.transactions.length) {
      throw new BadRequestException(
        'No transactions were detected in the recording',
      );
    }

    const transactionDate = this.parseAiDate(aiResponse.date);

    const transactions = await this.prisma.$transaction(async (tx) => {
      const results: Array<
        Awaited<ReturnType<typeof tx.transactions.update>> & {
          transaction_items: Awaited<
            ReturnType<typeof tx.transaction_items.create>
          >[];
        }
      > = [];

      for (const entry of aiResponse.transactions) {
        const unitPrice =
          entry.quantity > 0 ? entry.amount / entry.quantity : entry.amount;
        const itemName = normalizeItemName(entry.item);
        const unit = (entry.unit ?? '').trim() || 'unit';

        const transaction = await tx.transactions.create({
          data: {
            user_id: userId,
            transaction_type: entry.action,
            transaction_date: transactionDate,
            total_amount: entry.amount,
            currency: entry.currency,
            note: `Voice: "${aiResponse.transcript}"`,
            synced: false,
          },
        });

        const item = await tx.transaction_items.create({
          data: {
            transaction_id: transaction.id,
            item_name: itemName,
            quantity: entry.quantity,
            unit,
            unit_price: unitPrice,
            total_price: entry.amount,
          },
        });

        await this.syncInventoryForItem(
          tx,
          userId,
          entry.action.trim().toLowerCase(),
          { itemName, quantity: entry.quantity, unit, unitPrice },
        );

        const syncedTransaction = await tx.transactions.update({
          where: { id: transaction.id },
          data: { synced: true },
        });

        results.push({ ...syncedTransaction, transaction_items: [item] });
      }

      return results;
    });

    return {
      transcript: aiResponse.transcript,
      date: aiResponse.date,
      transactions,
    };
  }

  private async assertOwnership(id: bigint, userId: string) {
    const transaction = await this.prisma.transactions.findUnique({
      where: { id },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.user_id !== userId) {
      throw new ForbiddenException(
        'You do not have access to this transaction',
      );
    }

    return transaction;
  }

  /**
   * The single source of truth for keeping inventory_items consistent with
   * transaction_items. Runs inside the caller's Prisma transaction so a
   * failure here rolls back everything (transaction + items + inventory).
   */
  private async syncInventoryForItem(
    tx: Prisma.TransactionClient,
    userId: string,
    type: string,
    params: {
      itemName: string;
      quantity: number;
      unit: string;
      unitPrice: number;
    },
  ) {
    const { itemName, quantity, unit, unitPrice } = params;

    const isBuy = BUY_TYPES.has(type);
    const isSell = SELL_TYPES.has(type);

    if (!isBuy && !isSell) {
      // Other transaction types (debt_owed, debt_paid, expense, waste) do
      // not move physical stock, so inventory is left untouched.
      return;
    }

    if (quantity <= 0) {
      throw new BadRequestException(
        `Quantity for "${itemName}" must be greater than zero`,
      );
    }

    const existing = await tx.inventory_items.findFirst({
      where: {
        user_id: userId,
        item_name: { equals: itemName, mode: 'insensitive' },
      },
    });

    if (
      existing?.unit &&
      existing.unit.trim().toLowerCase() !== unit.toLowerCase()
    ) {
      throw new BadRequestException(
        `Unit mismatch for "${itemName}": inventory is tracked in "${existing.unit}", but this transaction uses "${unit}"`,
      );
    }

    if (isBuy) {
      if (!existing) {
        await tx.inventory_items.create({
          data: {
            user_id: userId,
            item_name: itemName,
            quantity,
            unit,
            average_cost: unitPrice,
          },
        });
        return;
      }

      const existingQty = Number(existing.quantity ?? 0);
      const existingAvgCost = Number(existing.average_cost ?? 0);
      const newQty = existingQty + quantity;
      const newAvgCost =
        newQty > 0
          ? (existingQty * existingAvgCost + quantity * unitPrice) / newQty
          : unitPrice;

      await tx.inventory_items.update({
        where: { id: existing.id },
        data: {
          quantity: newQty,
          unit: existing.unit ?? unit,
          average_cost: newAvgCost,
          updated_at: new Date(),
        },
      });
      return;
    }

    // SELL
    const existingQty = Number(existing?.quantity ?? 0);

    if (!existing || existingQty < quantity) {
      throw new BadRequestException(
        `Insufficient stock for "${itemName}": available ${existingQty} ${unit}, requested ${quantity} ${unit}`,
      );
    }

    await tx.inventory_items.update({
      where: { id: existing.id },
      data: {
        quantity: existingQty - quantity,
        updated_at: new Date(),
      },
    });
  }

  private parseAiDate(date: string): Date {
    const parsed = new Date(date);
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  }
}
