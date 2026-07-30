import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateInventoryItemDto {
  @ApiProperty({
    example: 'Rice',
  })
  @IsString()
  itemName!: string;

  @ApiProperty({
    example: 20,
  })
  @IsNumber()
  @IsPositive()
  quantity!: number;

  @ApiProperty({
    example: 'bag',
  })
  @IsString()
  unit!: string;

  @ApiProperty({
    example: 85000,
  })
  @IsNumber()
  averageCost!: number;
}