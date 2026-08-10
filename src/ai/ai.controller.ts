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
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { FileInterceptor } from '@nestjs/platform-express';

import { AiService } from './ai.service';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('AI')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
  ) {}

  @Post('voice-transaction')
  @UseInterceptors(
    FileInterceptor('audio'),
  )
  @ApiConsumes('multipart/form-data')
   @ApiOperation({
          summary: "Send the customer's recording here",
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
  async voiceTransaction(
    @UploadedFile()
    audio: Express.Multer.File,
  ) {
    if (!audio) {
      throw new BadRequestException(
        'Audio file is required',
      );
    }

    return this.aiService.voiceTransaction(audio);
  }

  @Post('extract-text')
  async extractText(
    @Body('transcript')
    transcript: string,
  ) {
    if (!transcript) {
      throw new BadRequestException(
        'Transcript is required',
      );
    }

    return this.aiService.extractText(
      transcript,
    );
  }

  @Get('predict')
  @ApiQuery({
    name: 'item',
    required: true,
  })
  @ApiQuery({
    name: 'market',
    required: false,
    example: 'Mile 12',
  })
  async predict(
    @Query('item') item: string,
    @Query('market') market?: string,
  ) {
    if (!item) {
      throw new BadRequestException(
        'Item is required',
      );
    }

    return this.aiService.predictPrice(
      item,
      market,
    );
  }

  @Get('recommend')
  @ApiQuery({
    name: 'item',
    required: true,
  })
  @ApiQuery({
    name: 'action',
    required: true,
    enum: ['buy', 'sell'],
  })
  async recommend(
    @Query('item') item: string,
    @Query('action')
    action: 'buy' | 'sell',
  ) {
    if (!item) {
      throw new BadRequestException(
        'Item is required',
      );
    }

    if (
      action !== 'buy' &&
      action !== 'sell'
    ) {
      throw new BadRequestException(
        'Action must be buy or sell',
      );
    }

    return this.aiService.recommend(
      item,
      action,
    );
  }
}