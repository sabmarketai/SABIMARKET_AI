import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationsService } from 'src/notifications/notifications.service';

import { CreateMarketPriceDto } from './dto/create-market-price.dto';
import { QueryMarketPricesDto } from './dto/query-market-prices.dto';

const SIGNIFICANT_CHANGE_PERCENT = 15;

function normalize(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

@Injectable()
export class MarketService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(userId: string, dto: CreateMarketPriceDto) {
    const marketName = normalize(dto.marketName);
    const itemName = normalize(dto.itemName);

    const previous = await this.prisma.market_prices.findFirst({
      where: {
        item_name: { equals: itemName, mode: 'insensitive' },
      },
      orderBy: { created_at: 'desc' },
    });

    const created = await this.prisma.market_prices.create({
      data: {
        market_name: marketName,
        item_name: itemName,
        price: dto.price,
        submitted_by: userId,
      },
    });

    await this.notifyOnSignificantChange(userId, itemName, previous, dto.price);

    return created;
  }

  async findAll(query: QueryMarketPricesDto) {
    return this.prisma.market_prices.findMany({
      where: {
        ...(query.market
          ? { market_name: { equals: normalize(query.market), mode: 'insensitive' } }
          : {}),
        ...(query.item
          ? { item_name: { equals: normalize(query.item), mode: 'insensitive' } }
          : {}),
      },
      orderBy: { created_at: 'desc' },
      take: query.limit ?? undefined,
    });
  }

  async findRecent(limit = 10) {
    return this.prisma.market_prices.findMany({
      orderBy: { created_at: 'desc' },
      take: limit,
    });
  }

  async findOne(id: bigint) {
    const price = await this.prisma.market_prices.findUnique({
      where: { id },
    });

    if (!price) {
      throw new NotFoundException('Market price not found');
    }

    return price;
  }

  async getInsights(item?: string) {
    if (item) {
      return this.buildItemInsight(normalize(item));
    }

    const distinctItems = await this.prisma.market_prices.findMany({
      where: { item_name: { not: null } },
      distinct: ['item_name'],
      select: { item_name: true },
    });

    const items: Array<Awaited<ReturnType<MarketService['buildItemInsight']>>> = [];
    for (const { item_name } of distinctItems) {
      if (!item_name) continue;
      items.push(await this.buildItemInsight(item_name));
    }

    return { items };
  }

  private async buildItemInsight(itemName: string) {
    const prices = await this.prisma.market_prices.findMany({
      where: { item_name: { equals: itemName, mode: 'insensitive' } },
      orderBy: { created_at: 'desc' },
    });

    if (prices.length === 0) {
      return {
        item: itemName,
        message: 'No price data available for this item',
        priceCount: 0,
      };
    }

    const latest = prices[0];
    const previous = prices.length > 1 ? prices[1] : null;

    const latestPrice = Number(latest.price ?? 0);
    const previousPrice = previous ? Number(previous.price ?? 0) : null;

    let percentChange: number | null = null;
    let trend: 'up' | 'down' | 'stable' = 'stable';

    if (previousPrice !== null && previousPrice !== 0) {
      percentChange = ((latestPrice - previousPrice) / previousPrice) * 100;
      trend = percentChange > 1 ? 'up' : percentChange < -1 ? 'down' : 'stable';
    }

    const latestByMarket = new Map<string, number>();
    for (const p of prices) {
      const market = p.market_name ?? 'Unknown';
      if (!latestByMarket.has(market)) {
        latestByMarket.set(market, Number(p.price ?? 0));
      }
    }

    const marketComparison = Array.from(latestByMarket.entries()).map(
      ([market, price]) => ({ market, price }),
    );

    const lowest = marketComparison.reduce((a, b) => (b.price < a.price ? b : a));
    const highest = marketComparison.reduce((a, b) => (b.price > a.price ? b : a));

    return {
      item: itemName,
      latestPrice,
      latestMarket: latest.market_name,
      previousPrice,
      percentChange: percentChange !== null ? Number(percentChange.toFixed(2)) : null,
      trend,
      lowestMarket: lowest,
      highestMarket: highest,
      marketComparison,
      priceCount: prices.length,
    };
  }

  private async notifyOnSignificantChange(
    userId: string,
    itemName: string,
    previous: { price: unknown } | null,
    newPrice: number,
  ) {
    if (!previous?.price) {
      return;
    }

    const previousPrice = Number(previous.price);
    if (previousPrice === 0) {
      return;
    }

    const percentChange = ((newPrice - previousPrice) / previousPrice) * 100;

    if (Math.abs(percentChange) < SIGNIFICANT_CHANGE_PERCENT) {
      return;
    }

    const direction = percentChange > 0 ? 'increased' : 'decreased';

    await this.notificationsService.create(
      userId,
      'market_price_change',
      `${itemName} price ${direction}`,
      `${itemName} ${direction} by ${Math.abs(percentChange).toFixed(1)}% (from ₦${previousPrice} to ₦${newPrice}).`,
    );
  }
}
