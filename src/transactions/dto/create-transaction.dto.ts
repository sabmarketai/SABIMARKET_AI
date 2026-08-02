export class CreateTransactionDto {
  transactionType!: string;

  totalAmount!: number;

  profit?: number;

  note?: string;
}