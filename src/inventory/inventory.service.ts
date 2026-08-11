import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from 'src/supabase/supabase.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';

@Injectable()
export class InventoryService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly prisma: PrismaService,
  ) {}

  async create(userId: string, dto: CreateInventoryItemDto) {
    return this.prisma.inventory_items.create({
      data: {
        user_id: userId,
        item_name: dto.itemName,
        quantity: dto.quantity,
        unit: dto.unit,
        average_cost: dto.averageCost,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.inventory_items.findMany({
      where: {
        user_id: userId,
      },
      orderBy: {
        updated_at: 'desc',
      },
    });
  }

  async findOne(id: bigint, userId: string) {
    return this.assertOwnership(id, userId);
  }

  async update(id: bigint, userId: string, dto: UpdateInventoryItemDto) {
    await this.assertOwnership(id, userId);

    return this.prisma.inventory_items.update({
      where: {
        id,
      },
      data: {
        item_name: dto.itemName,
        quantity: dto.quantity,
        unit: dto.unit,
        average_cost: dto.averageCost,
        updated_at: new Date(),
      },
    });
  }

  async remove(id: bigint, userId: string) {
    await this.assertOwnership(id, userId);

    return this.prisma.inventory_items.delete({
      where: {
        id,
      },
    });
  }

  async adjustStock(id: bigint, userId: string, quantity: number) {
    const item = await this.assertOwnership(id, userId);

    const newQuantity = Number(item.quantity ?? 0) + quantity;

    if (newQuantity < 0) {
      throw new BadRequestException(
        'Adjustment would result in negative stock',
      );
    }

    return this.prisma.inventory_items.update({
      where: {
        id,
      },
      data: {
        quantity: newQuantity,
        updated_at: new Date(),
      },
    });
  }

  private async assertOwnership(id: bigint, userId: string) {
    const item = await this.prisma.inventory_items.findUnique({
      where: {
        id,
      },
    });

    if (!item) {
      throw new NotFoundException('Inventory item not found');
    }

    if (item.user_id !== userId) {
      throw new ForbiddenException(
        'You do not have access to this inventory item',
      );
    }

    return item;
  }
}
