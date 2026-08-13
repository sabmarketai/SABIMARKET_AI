import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CreateTransactionItemDto } from './create-transaction-item.dto';
import { CreateTransactionDto } from './create-transaction.dto';

export class UpdateTransactionDto
  extends PartialType(
    CreateTransactionDto,
  ) { }
//  {
//   @ApiPropertyOptional({
//     example: 'Updated note for this transaction',
//     description:
//       'Only the note can be edited after creation. Editing type/amount/items is not supported because it would desynchronize inventory.',
//   })
//   @IsOptional()
//   @IsString()
//   note?: string;
// }
