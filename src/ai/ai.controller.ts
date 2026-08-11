import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { FileInterceptor } from '@nestjs/platform-express';

import { AiService } from './ai.service';
import { TransactionsService } from 'src/transactions/transactions.service';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { AuthUser } from 'src/auth/interfaces/auth-user.interface';

import { TranscriptRequestDto } from './dto/transcript-request.dto';
import {
  MarketRecommendationDto,
  PricePredictionDto,
} from './dto/market-response.dto';

@ApiTags('AI')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly transactionsService: TransactionsService,
  ) {}

  @Post('voice-transaction')
  @UseInterceptors(FileInterceptor('audio'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary:
      "Send the customer's recording here. The audio is transcribed and parsed by the AI service, then persisted as transactions for the authenticated user.",
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        audio: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['audio'],
    },
  })
  @ApiOkResponse({
    description:
      'The transcript, parsed date, and the transactions created for the authenticated user.',
    schema: {
      example: {
        transcript: 'I bought 5 baskets of tomatoes for 2000 naira',
        date: '2026-08-10',
        transactions: [
          {
            id: '1',
            user_id: '00000000-0000-0000-0000-000000000000',
            transaction_type: 'buy',
            transaction_date: '2026-08-10T00:00:00.000Z',
            total_amount: 2000,
            currency: 'NGN',
            note: 'Voice: "I bought 5 baskets of tomatoes for 2000 naira"',
            transaction_items: [
              {
                id: '1',
                transaction_id: '1',
                item_name: 'tomatoes',
                quantity: 5,
                unit: 'basket',
                unit_price: 400,
                total_price: 2000,
              },
            ],
          },
        ],
      },
    },
  })
  async voiceTransaction(
    @UploadedFile()
    audio: Express.Multer.File,
    @CurrentUser() user: AuthUser,
  ) {
    if (!audio) {
      throw new BadRequestException('Audio file is required');
    }

    const aiResult = await this.aiService.voiceTransaction(audio);
    

    return this.transactionsService.createFromAi(user.id, aiResult);
  }

  @Post('extract-text')
  @ApiOperation({
    summary:
      "For clients that already have a transcript (e.g. the browser's own speech recognition) — skips Whisper and goes straight to extraction, then persists the resulting transactions.",
  })
  @ApiOkResponse({
    description:
      'The transcript, parsed date, and the transactions created for the authenticated user.',
  })
  async extractText(
    @Body() dto: TranscriptRequestDto,
    @CurrentUser() user: AuthUser,
  ) {
    const aiResult = await this.aiService.extractText(dto.transcript);

    return this.transactionsService.createFromAi(user.id, aiResult);
  }

  @Get('predict')
  @ApiOperation({
    summary: 'Get a price prediction for an item at a given market.',
  })
  @ApiQuery({
    name: 'item',
    required: true,
  })
  @ApiQuery({
    name: 'market',
    required: false,
    example: 'Mile 12',
  })
  @ApiOkResponse({ type: PricePredictionDto })
  async predict(
    @Query('item') item: string,
    @Query('market') market?: string,
  ) {
    if (!item) {
      throw new BadRequestException('Item is required');
    }

    return this.aiService.predictPrice(item, market);
  }

  @Get('recommend')
  @ApiOperation({
    summary: 'Get a market recommendation for buying or selling an item.',
  })
  @ApiQuery({
    name: 'item',
    required: true,
  })
  @ApiQuery({
    name: 'action',
    required: true,
    enum: ['buy', 'sell'],
  })
  @ApiOkResponse({ type: MarketRecommendationDto })
  async recommend(
    @Query('item') item: string,
    @Query('action')
    action: 'buy' | 'sell',
  ) {
    if (!item) {
      throw new BadRequestException('Item is required');
    }

    if (action !== 'buy' && action !== 'sell') {
      throw new BadRequestException('Action must be buy or sell');
    }

    return this.aiService.recommend(item, action);
  }
}
