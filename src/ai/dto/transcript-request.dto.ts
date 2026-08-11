import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class TranscriptRequestDto {
  @ApiProperty({
    example: 'I bought 5 baskets of tomatoes for 2000 naira',
    description:
      "Transcript text, for clients that already have one (e.g. the browser's own speech recognition).",
  })
  @IsString()
  @IsNotEmpty()
  transcript!: string;
}
