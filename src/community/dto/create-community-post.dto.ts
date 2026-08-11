import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCommunityPostDto {
  @ApiProperty({ example: 'Best price for tomatoes today?' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @ApiProperty({ example: 'Anyone know where to get cheap tomatoes in Mile 12 this week?' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  content!: string;
}
