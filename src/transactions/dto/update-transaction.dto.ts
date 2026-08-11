import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateTransactionDto {
  @ApiPropertyOptional({
    description:
      'Only the note can be edited after creation. Editing type/amount/items is not supported because it would desynchronize inventory.',
  })
  @IsOptional()
  @IsString()
  note?: string;
}
