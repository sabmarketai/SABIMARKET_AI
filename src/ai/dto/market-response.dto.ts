import { ApiProperty } from '@nestjs/swagger';

export class WeatherInfoDto {
  @ApiProperty({ example: 'Mile 12' }) market!: string;
  @ApiProperty({ example: 28 }) temperature_c!: number;
  @ApiProperty({ example: 'Sunny' }) condition!: string;
  @ApiProperty({ example: false }) rain_expected!: boolean;
  @ApiProperty({ example: 10 }) rain_probability_percent!: number;
}

export class PricePredictionDto {
  @ApiProperty({ example: 'Tomatoes' }) item!: string;
  @ApiProperty({ example: 'Mile 12' }) market!: string;
  @ApiProperty({ example: 'basket' }) unit!: string;
  @ApiProperty({ example: 45000 }) current_avg_price!: number;
  @ApiProperty({ enum: ['up', 'down', 'stable'], example: 'up' }) trend!: string;
  @ApiProperty({ example: 5 }) percent_change!: number;
  @ApiProperty({ enum: ['low', 'medium', 'high'], example: 'high' }) confidence!: string;
  @ApiProperty({ example: 'Prices are expected to rise due to off-season.' }) advice!: string;
  @ApiProperty({ example: 'Historical data and weather patterns' }) data_source!: string;
  @ApiProperty({ type: WeatherInfoDto, nullable: true })
  weather?: WeatherInfoDto | null;
}

export class MarketOptionDto {
  @ApiProperty({ example: 'Oyingbo' }) market!: string;
  @ApiProperty({ example: 42000 }) current_avg_price!: number;
  @ApiProperty({ enum: ['up', 'down', 'stable'], example: 'stable' }) trend!: string;
  @ApiProperty({ example: 0 }) percent_change!: number;
  @ApiProperty({ type: WeatherInfoDto }) weather!: WeatherInfoDto;
}

export class MarketRecommendationDto {
  @ApiProperty({ example: 'Tomatoes' }) item!: string;
  @ApiProperty({ enum: ['buy', 'sell'], example: 'buy' }) action!: string;
  @ApiProperty({ example: 'Oyingbo' }) recommended_market!: string;
  @ApiProperty({ example: 'Oyingbo has the lowest average price currently and stable trends.' }) reason!: string;
  @ApiProperty({ type: [MarketOptionDto] }) options!: MarketOptionDto[];
}
