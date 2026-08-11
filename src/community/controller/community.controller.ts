import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { AuthUser } from 'src/auth/interfaces/auth-user.interface';

import { CommunityService } from '../community.service';
import { CreateCommunityPostDto } from '../dto/create-community-post.dto';
import { UpdateCommunityPostDto } from '../dto/update-community-post.dto';

@ApiTags('Community')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Post('posts')
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateCommunityPostDto) {
    return this.communityService.create(user.id, dto);
  }

  @Get('posts')
  findAll() {
    return this.communityService.findAll();
  }

  @Get('posts/:id')
  findOne(@Param('id') id: string) {
    return this.communityService.findOne(BigInt(id));
  }

  @Patch('posts/:id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateCommunityPostDto,
  ) {
    return this.communityService.update(BigInt(id), user.id, dto);
  }

  @Delete('posts/:id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.communityService.remove(BigInt(id), user.id);
  }
}
