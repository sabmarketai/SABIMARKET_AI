import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Get('health')
    health() {
        return this.authService.health();
    }

    @Post('register')
     @ApiOperation({
    summary: 'Register a new trader',
  })
  @ApiBody({
    type: RegisterDto,
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
  })
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }
}
