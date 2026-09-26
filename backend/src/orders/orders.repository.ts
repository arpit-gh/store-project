import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";

@Injectable()
export class OrdersRepository {
    constructor(private readonly prisma: PrismaService) {}

    // Expose prisma client for transactions
    get client() {
        return this.prisma;
    }

    async getStore(storeId: number) {
        return await this.prisma.store.findUnique({
            where: { id: storeId },
        });
    }

    async findCustomer(storeId: number, customerId: number) {
        return await this.prisma.customer.findFirst({
            where: { id: customerId, storeId },
        });
    }

    // Fetch customer's active cart with products and current inventory levels
    async findCartWithItems(storeId: number, customerId: number) {
        return await this.prisma.cart.findUnique({
            where: {
                storeId_customerId: {
                    storeId,
                    customerId,
                },
            },
            include: {
                cartItems: {
                    include: {
                        product: {
                            include: {
                                inventories: true,
                            },
                        },
                    },
                },
            },
        });
    }

    // Fetch single order with its items, product details, customer info, and payments
    async findOrderById(storeId: number, orderId: number) {
        return await this.prisma.order.findFirst({
            where: {
                id: orderId,
                storeId,
            },
            include: {
                orderItems: {
                    include: {
                        product: true,
                    },
                },
                customer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
                payments: true,
            },
        });
    }

    // Merchant view: list all orders for a store
    async findOrdersByStore(storeId: number, limit = 20, offset = 0) {
        return await this.prisma.order.findMany({
            where: { storeId },
            take: limit,
            skip: offset,
            orderBy: { createdAt: "desc" },
            include: {
                orderItems: {
                    include: {
                        product: true,
                    },
                },
                customer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
            },
        });
    }

    // Customer view: list customer's past orders in this store
    async findOrdersByCustomer(storeId: number, customerId: number, limit = 20, offset = 0) {
        return await this.prisma.order.findMany({
            where: { storeId, customerId },
            take: limit,
            skip: offset,
            orderBy: { createdAt: "desc" },
            include: {
                orderItems: {
                    include: {
                        product: true,
                    },
                },
            },
        });
    }
}
