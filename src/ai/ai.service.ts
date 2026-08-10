import {
    BadGatewayException,
    Injectable,
} from '@nestjs/common';

@Injectable()
export class AiService {
    private readonly aiUrl =
        process.env.AI_SERVICE_URL;

    async voiceTransaction(audio: Express.Multer.File) {
        if (!this.aiUrl) {
            throw new Error('AI_SERVICE_URL is not configured');
        }

        const formData = new FormData();

        // const blob = new Blob(
        //   [audio.buffer],
        //   {
        //     type: audio.mimetype,
        //   },
        // );

        const blob = new Blob([
            new Uint8Array(audio.buffer),
        ], {
            type: audio.mimetype,
        });

        formData.append(
            'audio',
            blob,
            audio.originalname,
        );

        try {
            const response = await fetch(
                `${this.aiUrl}/api/v1/voice/voice-transaction`,
                {
                    method: 'POST',
                    body: formData,
                },
            );

            if (!response.ok) {
                const errorText = await response.text();

                console.error(
                    'AI voice error:',
                    errorText,
                );

                throw new BadGatewayException(
                    'AI service failed to process voice',
                );
            }

            return await response.json();
        } catch (error) {
            console.error(
                'AI service connection error:',
                error,
            );

            throw new BadGatewayException(
                'Unable to connect to AI service',
            );
        }
    }

    async extractText(transcript: string) {
        if (!this.aiUrl) {
            throw new Error('AI_SERVICE_URL is not configured');
        }

        try {
            const response = await fetch(
                `${this.aiUrl}/api/v1/voice/extract-text`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        transcript,
                    }),
                },
            );

            if (!response.ok) {
                const errorText = await response.text();

                console.error(
                    'AI extraction error:',
                    errorText,
                );

                throw new BadGatewayException(
                    'AI service failed to extract transaction',
                );
            }

            return await response.json();
        } catch (error) {
            console.error(
                'AI service connection error:',
                error,
            );

            throw new BadGatewayException(
                'Unable to connect to AI service',
            );
        }
    }

    async predictPrice(
        item: string,
        market?: string,
    ) {
        if (!this.aiUrl) {
            throw new Error('AI_SERVICE_URL is not configured');
        }

        const params = new URLSearchParams({
            item,
        });

        if (market) {
            params.append('market', market);
        }

        try {
            const response = await fetch(
                `${this.aiUrl}/api/v1/market/predict?${params.toString()}`,
            );

            if (!response.ok) {
                throw new BadGatewayException(
                    'AI price prediction failed',
                );
            }

            return await response.json();
        } catch (error) {
            console.error(
                'AI prediction error:',
                error,
            );

            throw new BadGatewayException(
                'Unable to connect to AI service',
            );
        }
    }

    async recommend(
        item: string,
        action: 'buy' | 'sell',
    ) {
        if (!this.aiUrl) {
            throw new Error('AI_SERVICE_URL is not configured');
        }

        const params = new URLSearchParams({
            item,
            action,
        });

        try {
            const response = await fetch(
                `${this.aiUrl}/api/v1/market/recommend?${params.toString()}`,
            );

            if (!response.ok) {
                throw new BadGatewayException(
                    'AI recommendation failed',
                );
            }

            return await response.json();
        } catch (error) {
            console.error(
                'AI recommendation error:',
                error,
            );

            throw new BadGatewayException(
                'Unable to connect to AI service',
            );
        }
    }
}