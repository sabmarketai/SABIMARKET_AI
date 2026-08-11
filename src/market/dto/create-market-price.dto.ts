import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class CreateMarketPriceDto {
  @ApiProperty({ example: 'Mile 12' })
  @IsString()
  @IsNotEmpty()
  marketName!: string;

  @ApiProperty({ example: 'Orange' })
  @IsString()
  @IsNotEmpty()
  itemName!: string;

  @ApiProperty({ example: 500 })
  @IsNumber()
  @IsPositive()
  price!: number;
}
