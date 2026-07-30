import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class AdjustStockDto {
  @ApiProperty({
    example: -3,
  })
  @IsNumber()
  quantity!: number;
}