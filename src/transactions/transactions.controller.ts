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

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { AuthUser } from 'src/auth/interfaces/auth-user.interface';

import { TransactionsService } from './transactions.service';
import { TransactionItemsService } from './transaction-items.service';

import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

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
    return this.transactionsService.create(user.id, dto);
  }

  @Get()
  findAllTransactions(@CurrentUser() user: AuthUser) {
    return this.transactionsService.findAll(user.id);
  }

  @Get(':id')
  findTransaction(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ) {
    return this.transactionsService.findOne(BigInt(id), user.id);
  }

  @Patch(':id')
  updateTransaction(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(BigInt(id), user.id, dto);
  }

  @Delete(':id')
  deleteTransaction(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ) {
    return this.transactionsService.remove(BigInt(id), user.id);
  }

  @Post(':id/sync')
  syncTransaction(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ) {
    return this.transactionsService.syncTransactionInventory(
      BigInt(id),
      user.id,
    );
  }

  // ==========================
  // TRANSACTION ITEMS
  // ==========================

  @Get(':id/items')
  getTransactionItems(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ) {
    return this.transactionItemsService.findAll(BigInt(id), user.id);
  }
}
