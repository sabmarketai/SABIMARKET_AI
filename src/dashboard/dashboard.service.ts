import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DashboardService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    private async getUser(userId: string) {
        return this.prisma.users.findUnique({
            where: {
                id: userId,
            },
        });
    }

    //     private async getInventorySummary(userId: string) {
    //     const items =
    //         await this.prisma.inventory_items.findMany({
    //             where: {
    //                 user_id: userId,
    //             },
    //         });

    //     return {
    //         totalItems: items.length,
    //     };
    // }

    private async getInventorySummary(userId: string) {
        const items =
            await this.prisma.inventory_items.findMany({
                where: {
                    user_id: userId,
                },
            });

        return {
            totalItems: items.length,

            totalQuantity: items.reduce(
                (sum, item) => sum + Number(item.quantity ?? 0),
                0,
            ),

            inventoryValue: items.reduce(
                (sum, item) =>
                    sum +
                    Number(item.quantity ?? 0) *
                    Number(item.average_cost ?? 0),
                0,
            ),
        };
    }

    private async getLowStock(userId: string) {
        const items = await this.prisma.inventory_items.findMany({
            where: {
                user_id: userId,
            },
            select: {
                id: true,
                item_name: true,
                quantity: true,
                unit: true,
                // minimum_stock: true,
            },
        });


        const LOW_STOCK_THRESHOLD = 5;

        const lowStock = items.filter(item => {
            if (
                item.quantity == null
                //  ||
                // item.minimum_stock == null
            ) {
                return false;
            }

            // return Number(item.quantity) <= Number(item.minimum_stock);
            return Number(item.quantity) <= LOW_STOCK_THRESHOLD;

        });


        return {
            count: lowStock.length,
            message:
                lowStock.length === 0
                    ? "No low stock items."
                    : `${lowStock.length} items need restocking.`,
            items: lowStock,
        };
    }

    private async getTodaySummary(userId: string) {
        const start = new Date();

        start.setHours(0, 0, 0, 0);

        const end = new Date();

        end.setHours(23, 59, 59, 999);

        const transactions =
            await this.prisma.transactions.findMany({
                where: {
                    user_id: userId,
                    transaction_date: {
                        gte: start,
                        lte: end,
                    },
                },
            });

        const sales = transactions.filter(
            t => t.transaction_type === 'sell',
        );

        const purchases = transactions.filter(
            t => t.transaction_type === 'buy',
        );

        const expenses = transactions.filter(
            t => t.transaction_type === 'expense',
        );

        return {
            salesCount: sales.length,
            
            purchasesCount: purchases.length,


            expenseCount: expenses.length,

            totalSales: sales.reduce(
                (sum, t) =>
                    sum + Number(t.total_amount ?? 0),
                0,
            ),

            totalExpenses: expenses.reduce(
                (sum, t) =>
                    sum + Number(t.total_amount ?? 0),
                0,
            ),

            totalProfit: sales.reduce(
                (sum, t) =>
                    sum + Number(t.profit ?? 0),
                0,
            ),
        };
    }

    private async getRecentTransactions(
        userId: string,
    ) {
        return this.prisma.transactions.findMany({
            where: {
                user_id: userId,
            },

            include: {
                transaction_items: true,
            },

            orderBy: {
                created_at: 'desc',
            },

            take: 5,
        });
    }

    private async getMarketInsight() {
        const latest =
            await this.prisma.market_prices.findFirst({
                orderBy: {
                    created_at: 'desc',
                },
            });

        if (!latest) {
            return {
                message:
                    'No market insights available.',
                type: 'info',
            };
        }

        return {
            message:
                `${latest.item_name} is selling for ₦${latest.price} in ${latest.market_name}`,

            type: 'market_price',
        };
    }

    async getDashboard(userId: string) {
        const user = await this.getUser(userId);

        const today = await this.getTodaySummary(userId);

        const inventory = await this.getInventorySummary(userId);

        const alerts = await this.getLowStock(userId);

        const recent = await this.getRecentTransactions(userId);

        const market = await this.getMarketInsight();

        return {
            user,
            today,
            inventory,
            alerts,
            recent,
            market,
        };
    }
}
