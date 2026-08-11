import { Module } from '@nestjs/common';
import { MarketService } from './market.service';
import { MarketController } from './controller/market.controller';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  providers: [MarketService],
  controllers: [MarketController],
  exports: [MarketService],
})
export class MarketModule {}
