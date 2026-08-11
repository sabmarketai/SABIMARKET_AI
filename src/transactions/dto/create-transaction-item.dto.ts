import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class CreateTransactionItemDto {
  @ApiProperty({ example: 'Orange' })
  @IsString()
  @IsNotEmpty()
  itemName!: string;

  @ApiProperty({ example: 5 })
  @IsNumber()
  @IsPositive()
  quantity!: number;

  @ApiProperty({ example: 'piece' })
  @IsString()
  @IsNotEmpty()
  unit!: string;

  @ApiProperty({ example: 500 })
  @IsNumber()
  @Min(0)
  unitPrice!: number;
}
