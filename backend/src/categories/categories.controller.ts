import { Body, Controller, Delete, Get, Headers, Param, Patch, Post } from "@nestjs/common";
import { CategoriesService, type CreateCategoryInput, type UpdateCategoryInput } from "./categories.service.js";

@Controller("stores/:storeId/categories")
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) {}

    // Public: list categories for store
    @Get()
    getCategories(@Param("storeId") storeId: string) {
        return this.categoriesService.getCategories(Number(storeId));
    }

    // Public: get single category with its products
    @Get(":categoryId")
    getCategoryById(
        @Param("storeId") storeId: string,
        @Param("categoryId") categoryId: string,
    ) {
        return this.categoriesService.getCategoryById(Number(storeId), Number(categoryId));
    }

    // Owner only: create category
    @Post()
    createCategory(
        @Param("storeId") storeId: string,
        @Headers("x-user-id") userId: string,
        @Body() body: CreateCategoryInput,
    ) {
        const currentUserId = userId ? Number(userId) : 1;
        return this.categoriesService.createCategory(Number(storeId), currentUserId, body);
    }

    // Owner only: update category
    @Patch(":categoryId")
    updateCategory(
        @Param("storeId") storeId: string,
        @Param("categoryId") categoryId: string,
        @Headers("x-user-id") userId: string,
        @Body() body: UpdateCategoryInput,
    ) {
        const currentUserId = userId ? Number(userId) : 1;
        return this.categoriesService.updateCategory(
            Number(storeId),
            currentUserId,
            Number(categoryId),
            body,
        );
    }

    // Owner only: delete category
    @Delete(":categoryId")
    deleteCategory(
        @Param("storeId") storeId: string,
        @Param("categoryId") categoryId: string,
        @Headers("x-user-id") userId: string,
    ) {
        const currentUserId = userId ? Number(userId) : 1;
        return this.categoriesService.deleteCategory(
            Number(storeId),
            currentUserId,
            Number(categoryId),
        );
    }
}
