import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from 'src/supabase/supabase.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';

@Injectable()
export class InventoryService {

    constructor(
        private readonly supabaseService: SupabaseService,
        private readonly prisma: PrismaService,
    ) { }

    async create(
        userId: string,
        dto: CreateInventoryItemDto,
    ) {
        console.log('User ID:', userId);
        console.log('DTO:', dto);
        try {
            await this.prisma.$queryRaw`SELECT 1`;
console.log('Database connection OK');
            return await this.prisma.inventory_items.create({
                data: {
                    user_id: userId,
                    item_name: dto.itemName,
                    quantity: dto.quantity,
                    unit: dto.unit,
                    average_cost: dto.averageCost,
                },
            });
        } catch (error) {
            console.error(error);
            throw error;
        }
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


    async findOne(id: bigint) {
        return this.prisma.inventory_items.findUnique({
            where: {
                id,
            },
        });
    }

    async update(
        id: bigint,
        dto: UpdateInventoryItemDto,
    ) {
        return this.prisma.inventory_items.update({
            where: {
                id,
            },
            data: {
                item_name: dto.itemName,
                quantity: dto.quantity,
                unit: dto.unit,
                average_cost: dto.averageCost,
            },
        });
    }

    async remove(id: bigint) {
        return this.prisma.inventory_items.delete({
            where: {
                id,
            },
        });
    }


    async adjustStock(
        id: bigint,
        quantity: number,
    ) {
        const item =
            await this.prisma.inventory_items.findUnique({
                where: {
                    id,
                },
            });

        if (!item) {
            throw new NotFoundException(
                'Inventory item not found',
            );
        }

        return this.prisma.inventory_items.update({
            where: {
                id,
            },
            data: {
                quantity: Number(item.quantity) + quantity,
            },
        });
    }
}
