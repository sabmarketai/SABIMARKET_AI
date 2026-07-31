import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import type { AuthUser } from './interfaces/auth-user.interface';

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


    @Post('login')
    @ApiOperation({
        summary: 'Login a trader',
    })
    @ApiBody({
        type: LoginDto,
    })
    @ApiResponse({
        status: 200,
        description: 'Login successful',
    })
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @Get('google')
    @ApiOperation({
        summary: 'Login with Google',
    })
    // googleLogin() {
    //     return this.authService.googleLogin();
    // }
    google(
        @Query('redirectTo') redirectTo: string,
    ) {
        return this.authService.googleLogin(redirectTo);
    }


    @Post('google/complete')
    @UseGuards(JwtAuthGuard)
    completeGoogle(
        @CurrentUser() user: AuthUser,
    ) {
        return this.authService.completeGoogle(user);
    }
}
