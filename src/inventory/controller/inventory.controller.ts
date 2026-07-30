import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CreateInventoryItemDto } from "../dto/create-inventory-item.dto";
import { UpdateInventoryItemDto } from "../dto/update-inventory-item.dto";
import { AdjustStockDto } from "../dto/adjust-stock-item.dto";
import { InventoryService } from "../inventory.service";
import { CurrentUser } from "src/auth/decorators/current-user.decorator";
import type { AuthUser } from "src/auth/interfaces/auth-user.interface";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";

@ApiBearerAuth('access-token')
@Controller('inventory')
@UseGuards(JwtAuthGuard)
@ApiTags('Inventory')
export class InventoryController {
  constructor(
    private readonly inventoryService: InventoryService,
  ) {}

  @Post()
  create(@Body() dto: CreateInventoryItemDto, @CurrentUser() user: AuthUser, ) {
     console.log('Current User:', user);
  console.log('DTO:', dto);
    // const userId =  req.user.id;

    return this.inventoryService.create(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: AuthUser) {

    return this.inventoryService.findAll(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: bigint) {
    return this.inventoryService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: bigint,
    @Body() dto: UpdateInventoryItemDto,
  ) {
    return this.inventoryService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: bigint) {
    return this.inventoryService.remove(id);
  }

  @Post(':id/adjust')
  adjustStock(
    @Param('id') id: bigint,
    @Body() dto: AdjustStockDto,
  ) {
    return this.inventoryService.adjustStock(id, dto.quantity);
  }
}