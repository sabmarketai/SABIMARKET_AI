import {
  BadGatewayException,
  BadRequestException,
  GatewayTimeoutException,
  Injectable,
  InternalServerErrorException,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  AiMarketRecommendation,
  AiPricePrediction,
  AiTransactionAction,
  AiVoiceTransactionResponse,
} from './interfaces/ai-responses.interface';

const VALID_ACTIONS: AiTransactionAction[] = [
  'buy',
  'sell',
  'debt_owed',
  'debt_paid',
  'expense',
  'waste',
];

const DEFAULT_TIMEOUT_MS = 15000;
const VOICE_TIMEOUT_MS = 30000;

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly aiUrl?: string;
  private readonly apiKey?: string;

  constructor(private readonly configService: ConfigService) {
    const configuredUrl = this.configService.get<string>('AI_SERVICE_URL');
    this.aiUrl = configuredUrl?.replace(/\/+$/, '');
    this.apiKey = this.configService.get<string>('AI_SERVICE_API_KEY');
  }

  async voiceTransaction(
    audio: Express.Multer.File,
  ): Promise<AiVoiceTransactionResponse> {
    const formData = new FormData();
    const blob = new Blob([new Uint8Array(audio.buffer)], {
      type: audio.mimetype,
    });
    formData.append('audio', blob, audio.originalname);

    const response = await this.request(
      '/api/v1/voice/voice-transaction',
      { method: 'POST', body: formData },
      VOICE_TIMEOUT_MS,
      'voice-transaction',
    );

    return this.parseVoiceTransactionResponse(response);
  }

  async extractText(
    transcript: string,
  ): Promise<AiVoiceTransactionResponse> {
    const response = await this.request(
      '/api/v1/voice/extract-text',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      },
      DEFAULT_TIMEOUT_MS,
      'extract-text',
    );

    return this.parseVoiceTransactionResponse(response);
  }

  async predictPrice(
    item: string,
    market?: string,
  ): Promise<AiPricePrediction> {
    const params = new URLSearchParams({ item });
    if (market) {
      params.append('market', market);
    }

    const response = await this.request(
      `/api/v1/market/predict?${params.toString()}`,
      { method: 'GET' },
      DEFAULT_TIMEOUT_MS,
      'market-predict',
    );

    return this.parseJson<AiPricePrediction>(response, 'market-predict');
  }

  async recommend(
    item: string,
    action: 'buy' | 'sell',
  ): Promise<AiMarketRecommendation> {
    const params = new URLSearchParams({ item, action });

    const response = await this.request(
      `/api/v1/market/recommend?${params.toString()}`,
      { method: 'GET' },
      DEFAULT_TIMEOUT_MS,
      'market-recommend',
    );

    return this.parseJson<AiMarketRecommendation>(
      response,
      'market-recommend',
    );
  }

  private assertConfigured(): string {
    if (!this.aiUrl) {
      throw new InternalServerErrorException(
        'AI_SERVICE_URL is not configured',
      );
    }
    return this.aiUrl;
  }

  private buildHeaders(
    extra?: Record<string, string>,
  ): Record<string, string> {
    const headers: Record<string, string> = { ...extra };
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }
    return headers;
  }

  private async request(
    path: string,
    init: RequestInit,
    timeoutMs: number,
    context: string,
  ): Promise<Response> {
    const baseUrl = this.assertConfigured();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    let response: Response;
    try {
      response = await fetch(`${baseUrl}${path}`, {
        ...init,
        headers: this.buildHeaders(
          init.headers as Record<string, string> | undefined,
        ),
        signal: controller.signal,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        this.logger.error(`AI service timed out during ${context}`);
        throw new GatewayTimeoutException(
          'AI service took too long to respond',
        );
      }

      this.logger.error(
        `AI service connection error during ${context}: ${(error as Error)?.message}`,
      );
      throw new ServiceUnavailableException('Unable to reach AI service');
    } finally {
      clearTimeout(timeout);
    }

    await this.ensureOk(response, context);

    return response;
  }

  private async ensureOk(
    response: Response,
    context: string,
  ): Promise<void> {
    if (response.ok) {
      return;
    }

    const text = await response.text().catch(() => '');
    this.logger.error(
      `AI service returned ${response.status} for ${context}: ${text}`,
    );

    if (response.status === 422) {
      throw new BadRequestException(
        'AI service could not process the request',
      );
    }

    throw new BadGatewayException(
      'AI service failed to process the request',
    );
  }

  private async parseJson<T>(
    response: Response,
    context: string,
  ): Promise<T> {
    try {
      return (await response.json()) as T;
    } catch {
      this.logger.error(`AI service returned invalid JSON for ${context}`);
      throw new BadGatewayException('AI service returned an invalid response');
    }
  }

  private async parseVoiceTransactionResponse(
    response: Response,
  ): Promise<AiVoiceTransactionResponse> {
    const data = await this.parseJson<unknown>(response, 'voice-transaction');
    return this.validateVoiceTransactionResponse(data);
  }

  private validateVoiceTransactionResponse(
    data: unknown,
  ): AiVoiceTransactionResponse {
    if (
      !data ||
      typeof data !== 'object' ||
      typeof (data as any).transcript !== 'string' ||
      typeof (data as any).date !== 'string' ||
      !Array.isArray((data as any).transactions)
    ) {
      throw new BadGatewayException(
        'AI service returned an unexpected response shape',
      );
    }

    const transactions = (data as any).transactions;

    for (const entry of transactions) {
      const validEntry =
        entry &&
        typeof entry === 'object' &&
        VALID_ACTIONS.includes(entry.action) &&
        typeof entry.item === 'string' &&
        typeof entry.quantity === 'number' &&
        typeof entry.amount === 'number' &&
        (entry.unit === undefined ||
          entry.unit === null ||
          typeof entry.unit === 'string') &&
        (entry.currency === undefined || typeof entry.currency === 'string');

      if (!validEntry) {
        throw new BadGatewayException(
          'AI service returned an unexpected transaction shape',
        );
      }

      entry.currency = entry.currency ?? 'NGN';
    }

    return data as AiVoiceTransactionResponse;
  }
}
