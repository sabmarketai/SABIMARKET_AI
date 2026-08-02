import { Module } from "@nestjs/common";
import { TransactionsService } from "./transactions.service";
import { TransactionItemsService } from "./transaction-items.service";
import { TransactionsController } from "./transactions.controller";

@Module({
  providers: [
    TransactionsService,
    TransactionItemsService,
  ],
  controllers: [
    TransactionsController,
  ],
})
export class TransactionsModule {}