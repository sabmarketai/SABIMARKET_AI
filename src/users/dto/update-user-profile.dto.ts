import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserProfileDto {
  @ApiPropertyOptional({
    example: '08012345678',
    description: 'User phone number',
  })
  @IsOptional()
  @IsString()
  @MinLength(7)
  phoneNumber?: string;

  @ApiPropertyOptional({
    example: 'Mile 12 Market, Lagos',
    description: 'User market location',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  marketLocation?: string;

  @ApiPropertyOptional({
    example: 'Bolu',
    description: 'User full name',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  fullName?: string;
}