import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import type { AuthUser } from 'src/auth/interfaces/auth-user.interface';
import { DashboardService } from './dashboard.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';


@ApiTags('Dashboard')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
     constructor(
        private readonly dashboardService: DashboardService,
      ) {}


    @Get()
    dashboard(@CurrentUser() user: AuthUser) {
        return this.dashboardService.getDashboard(user.id);
    }
}
