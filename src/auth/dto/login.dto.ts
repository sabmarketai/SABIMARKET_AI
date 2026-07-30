import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MinLength } from 'class-validator';

export class LoginDto {
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
}