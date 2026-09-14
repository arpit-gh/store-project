import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";

export type CreateCustomerRepoInput = {
    name: string;
    email: string;
    phone: string;
    address: string;
    passwordHash?: string | null;
};

export type UpdateCustomerRepoInput = {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
};

@Injectable()
export class CustomersRepository {
    constructor(private readonly prisma: PrismaService) {}

    async getStore(storeId: number) {
        return await this.prisma.store.findUnique({
            where: { id: storeId },
        });
    }

    async findCustomerByEmail(storeId: number, email: string) {
        return await this.prisma.customer.findUnique({
            where: {
                storeId_email: {
                    storeId,
                    email,
                },
            },
        });
    }

    async findCustomerById(storeId: number, customerId: number) {
        return await this.prisma.customer.findFirst({
            where: {
                id: customerId,
                storeId,
            },
        });
    }

    async findManyByStore(storeId: number, limit = 20, offset = 0) {
        return await this.prisma.customer.findMany({
            where: { storeId },
            take: limit,
            skip: offset,
            orderBy: { createdAt: "desc" },
            include: {
                _count: {
                    select: {
                        orders: true,
                    },
                },
            },
        });
    }

    async createCustomer(storeId: number, data: CreateCustomerRepoInput) {
        return await this.prisma.customer.create({
            data: {
                storeId,
                name: data.name,
                email: data.email,
                phone: data.phone,
                address: data.address,
                passwordHash: data.passwordHash ?? null,
            },
        });
    }

    async updateCustomer(storeId: number, customerId: number, data: UpdateCustomerRepoInput) {
        return await this.prisma.customer.update({
            where: { id: customerId, storeId },
            data,
        });
    }
}
