import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export class QueryMarketPricesDto {
  @ApiPropertyOptional({ example: 'Mile 12' })
  @IsOptional()
  @IsString()
  market?: string;

  @ApiPropertyOptional({ example: 'Orange' })
  @IsOptional()
  @IsString()
  item?: string;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  limit?: number;
}
