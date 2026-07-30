import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CreateInventoryItemDto } from "../dto/create-inventory-item.dto";
import { UpdateInventoryItemDto } from "../dto/update-inventory-item.dto";
import { AdjustStockDto } from "../dto/adjust-stock-item.dto";
import { InventoryService } from "../inventory.service";

@Controller('inventory')
@ApiTags('Inventory')
export class InventoryController {
  constructor(
    private readonly inventoryService: InventoryService,
  ) {}

  @Post()
  create(@Body() dto: CreateInventoryItemDto) {
    const userId = 'HARDCODED-FOR-NOW';

    return this.inventoryService.create(userId, dto);
  }

  @Get()
  findAll() {
    const userId = 'HARDCODED-FOR-NOW';

    return this.inventoryService.findAll(userId);
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