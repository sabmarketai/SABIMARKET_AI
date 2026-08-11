import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { AuthUser } from 'src/auth/interfaces/auth-user.interface';

import { MarketService } from '../market.service';
import { CreateMarketPriceDto } from '../dto/create-market-price.dto';
import { QueryMarketPricesDto } from '../dto/query-market-prices.dto';

@ApiTags('Market')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('market')
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @Post('prices')
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateMarketPriceDto) {
    return this.marketService.create(user.id, dto);
  }

  @Get('prices/recent')
  findRecent(@Query('limit') limit?: string) {
    return this.marketService.findRecent(limit ? Number(limit) : undefined);
  }

  @Get('prices/:id')
  findOne(@Param('id') id: string) {
    return this.marketService.findOne(BigInt(id));
  }

  @Get('prices')
  findAll(@Query() query: QueryMarketPricesDto) {
    return this.marketService.findAll(query);
  }

  @Get('insights')
  getInsights(@Query('item') item?: string) {
    return this.marketService.getInsights(item);
  }
}
