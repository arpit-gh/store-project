import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { CategoriesRepository } from "./categories.repository.js";

export type CreateCategoryInput = {
    name: string;
    slug: string;
};

export type UpdateCategoryInput = {
    name?: string;
    slug?: string;
};

@Injectable()
export class CategoriesService {
    constructor(private readonly categoriesRepository: CategoriesRepository) {}

    // List categories for a store with product count
    async getCategories(storeId: number) {
        return await this.categoriesRepository.findManyByStoreWithCount(storeId);
    }

    // Get single category by ID with its products
    async getCategoryById(storeId: number, categoryId: number) {
        const category = await this.categoriesRepository.findCategoryByIdWithProducts(storeId, categoryId);

        if (!category) {
            throw new NotFoundException("Category not found");
        }

        return category;
    }

    // Create a new category scoped to store
    async createCategory(storeId: number, userId: number, input: CreateCategoryInput) {
        const store = await this.categoriesRepository.getStore(storeId);
        if (!store) {
            throw new NotFoundException("Store not found");
        }
        if (store.ownerUserId !== userId) {
            throw new ForbiddenException("You are not authorized to create category in this store");
        }

        const normalizedSlug = input.slug.trim().toLowerCase();

        const existingSlug = await this.categoriesRepository.findCategoryBySlug(storeId, normalizedSlug);
        if (existingSlug) {
            throw new BadRequestException("Slug already exists in this store");
        }

        return await this.categoriesRepository.createCategory(storeId, {
            name: input.name,
            slug: normalizedSlug,
        });
    }

    // Update an existing category
    async updateCategory(storeId: number, userId: number, categoryId: number, input: UpdateCategoryInput) {
        const store = await this.categoriesRepository.getStore(storeId);
        if (!store) {
            throw new NotFoundException("Store not found");
        }
        if (store.ownerUserId !== userId) {
            throw new ForbiddenException("You are not authorized to update category in this store");
        }

        const category = await this.categoriesRepository.findCategoryById(storeId, categoryId);
        if (!category) {
            throw new NotFoundException("Category does not exist");
        }

        let normalizedSlug = category.slug;

        if (input.slug) {
            normalizedSlug = input.slug.trim().toLowerCase();

            if (normalizedSlug !== category.slug) {
                const isTaken = await this.categoriesRepository.findCategoryBySlug(storeId, normalizedSlug);
                
                if (isTaken) {
                    throw new BadRequestException("Slug already exists in this store");
                }
            }
        }

        return await this.categoriesRepository.updateCategory(storeId, categoryId, {
            name: input.name ?? category.name,
            slug: normalizedSlug,
        });
    }

    // Delete category (cascade will remove join records automatically)
    async deleteCategory(storeId: number, userId: number, categoryId: number) {
        const store = await this.categoriesRepository.getStore(storeId);
        if (!store) {
            throw new NotFoundException("Store not found");
        }
        if (store.ownerUserId !== userId) {
            throw new ForbiddenException("You are not authorized to delete this category");
        }

        const category = await this.categoriesRepository.findCategoryById(storeId, categoryId);
        if (!category) {
            throw new NotFoundException("Category does not exist");
        }

        return await this.categoriesRepository.deleteCategory(storeId, categoryId);
    }
}
