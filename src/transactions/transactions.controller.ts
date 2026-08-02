import {
  Body,
  Controller,
 Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { AuthUser } from 'src/auth/interfaces/auth-user.interface';

import { TransactionsService } from './transactions.service';
import { TransactionItemsService } from './transaction-items.service';

import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

import { CreateTransactionItemDto } from './dto/create-transaction-item.dto';
import { UpdateTransactionItemDto } from './dto/update-transaction-item.dto';

@ApiTags('Transactions')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly transactionItemsService: TransactionItemsService,
  ) {}

  // ==========================
  // TRANSACTIONS
  // ==========================

  @Post()
  createTransaction(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateTransactionDto,
  ) {
    return this.transactionsService.create(
      user.id,
      dto,
    );
  }

  @Get()
  findAllTransactions(
    @CurrentUser() user: AuthUser,
  ) {
    return this.transactionsService.findAll(
      user.id,
    );
  }

  @Get(':id')
  findTransaction(
    @Param('id') id: string,
  ) {
    return this.transactionsService.findOne(
      BigInt(id),
    );
  }

  @Patch(':id')
  updateTransaction(
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(
      BigInt(id),
      dto,
    );
  }

  @Delete(':id')
  deleteTransaction(
    @Param('id') id: string,
  ) {
    return this.transactionsService.remove(
      BigInt(id),
    );
  }

  // ==========================
  // TRANSACTION ITEMS
  // ==========================

  @Post(':id/items')
  createTransactionItem(
    @Param('id') id: string,
    @Body() dto: CreateTransactionItemDto,
  ) {
    return this.transactionItemsService.create(
      BigInt(id),
      dto,
    );
  }

  @Get(':id/items')
  getTransactionItems(
    @Param('id') id: string,
  ) {
    return this.transactionItemsService.findAll(
      BigInt(id),
    );
  }

  @Patch('items/:itemId')
  updateTransactionItem(
    @Param('itemId') itemId: string,
    @Body() dto: UpdateTransactionItemDto,
  ) {
    return this.transactionItemsService.update(
      BigInt(itemId),
      dto,
    );
  }

  @Delete('items/:itemId')
  deleteTransactionItem(
    @Param('itemId') itemId: string,
  ) {
    return this.transactionItemsService.remove(
      BigInt(itemId),
    );
  }
}