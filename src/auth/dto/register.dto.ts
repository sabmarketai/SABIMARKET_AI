import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'trader@example.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'password123',
  })
  @MinLength(6)
  password!: string;

  @ApiProperty({
    example: 'Aisha Bello',
  })
  @IsString()
  fullName!: string;

  @ApiProperty({
    example: '08031234567',
    required: false,
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({
    example: 'Balogun Market',
    required: false,
  })
  @IsOptional()
  @IsString()
  marketLocation?: string;
}
