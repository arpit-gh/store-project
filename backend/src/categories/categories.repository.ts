import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import type { CreateCategoryInput, UpdateCategoryInput } from "./categories.service.js";

@Injectable()
export class CategoriesRepository {
    constructor(private readonly prisma: PrismaService) {}

    async createCategory(storeId: number, input: CreateCategoryInput) {
        return this.prisma.category.create({
            data: {
                storeId,
                name: input.name,
                slug: input.slug,
            },
        });
    }

    async findManyByStoreWithCount(storeId: number) {
        return this.prisma.category.findMany({
            where: { storeId },
            include: {
                _count: {
                    select: {
                        productCategories: true,
                    },
                },
            },
            orderBy: { name: "asc" },
        });
    }

    async getStore(storeId: number) {
        return this.prisma.store.findFirst({
            where: { id: storeId },
        });
    }

    async findCategoryBySlug(storeId: number, slug: string) {
        return this.prisma.category.findFirst({
            where: {
                storeId,
                slug,
            },
        });
    }

    async findCategoryById(storeId: number, categoryId: number) {
        return this.prisma.category.findFirst({
            where: { storeId, id: categoryId },
        });
    }

    async findCategoryByIdWithProducts(storeId: number, categoryId: number) {
        return this.prisma.category.findFirst({
            where: { storeId, id: categoryId },
            include: {
                productCategories: {
                    include: {
                        product: true,
                    },
                },
            },
        });
    }

    async updateCategory(storeId: number, categoryId: number, input: UpdateCategoryInput) {
        return this.prisma.category.update({
            where: { id: categoryId, storeId },
            data: {
                name: input.name,
                slug: input.slug,
            },
        });
    }

    async deleteCategory(storeId: number, categoryId: number) {
        return this.prisma.category.delete({
            where: { id: categoryId, storeId },
        });
    }
}