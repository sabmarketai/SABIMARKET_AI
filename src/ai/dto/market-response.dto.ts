import { ApiProperty } from '@nestjs/swagger';

export class WeatherInfoDto {
  @ApiProperty() market!: string;
  @ApiProperty() temperature_c!: number;
  @ApiProperty() condition!: string;
  @ApiProperty() rain_expected!: boolean;
  @ApiProperty() rain_probability_percent!: number;
}

export class PricePredictionDto {
  @ApiProperty() item!: string;
  @ApiProperty() market!: string;
  @ApiProperty() unit!: string;
  @ApiProperty() current_avg_price!: number;
  @ApiProperty({ enum: ['up', 'down', 'stable'] }) trend!: string;
  @ApiProperty() percent_change!: number;
  @ApiProperty({ enum: ['low', 'medium', 'high'] }) confidence!: string;
  @ApiProperty() advice!: string;
  @ApiProperty() data_source!: string;
  @ApiProperty({ type: WeatherInfoDto, nullable: true })
  weather?: WeatherInfoDto | null;
}

export class MarketOptionDto {
  @ApiProperty() market!: string;
  @ApiProperty() current_avg_price!: number;
  @ApiProperty({ enum: ['up', 'down', 'stable'] }) trend!: string;
  @ApiProperty() percent_change!: number;
  @ApiProperty({ type: WeatherInfoDto }) weather!: WeatherInfoDto;
}

export class MarketRecommendationDto {
  @ApiProperty() item!: string;
  @ApiProperty({ enum: ['buy', 'sell'] }) action!: string;
  @ApiProperty() recommended_market!: string;
  @ApiProperty() reason!: string;
  @ApiProperty({ type: [MarketOptionDto] }) options!: MarketOptionDto[];
}
