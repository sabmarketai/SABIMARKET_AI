import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { CreateTransactionItemDto } from './create-transaction-item.dto';

export class CreateTransactionDto {
  @ApiProperty({ example: 'buy', description: 'e.g. buy, sell, debt_owed, debt_paid, expense, waste' })
  @IsString()
  @IsNotEmpty()
  transactionType!: string;

  @ApiProperty({ example: 42500 })
  @IsNumber()
  @Min(0)
  totalAmount!: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  profit?: number;

  @ApiPropertyOptional({ example: 'NGN' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: 'Bought stock from Mile 12' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({ type: [CreateTransactionItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateTransactionItemDto)
  items!: CreateTransactionItemDto[];
}
