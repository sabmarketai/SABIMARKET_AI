import {
  Body,
  Controller,
  Get,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { AuthUser } from 'src/auth/interfaces/auth-user.interface';

import { UpdateUserProfileDto } from './dto/update-user-profile.dto';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

//   @Get('me')
//   @ApiOperation({
//     summary: 'Get current user profile',
//   })
//   getMe(@CurrentUser() user: AuthUser) {
//     return this.usersService.getProfil(user.id);
//   }

  @Patch('me')
  @ApiOperation({
    summary: 'Update current user profile',
  })
  updateMe(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateUserProfileDto,
  ) {
    return this.usersService.updateProfile(
      user.id,
      dto,
    );
  }
}






// import { Controller } from '@nestjs/common';

// @Controller('users')
// export class UsersController {}