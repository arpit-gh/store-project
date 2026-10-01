import { Test, TestingModule } from "@nestjs/testing";
import { ForbiddenException, BadRequestException, NotFoundException } from "@nestjs/common";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CategoriesService } from "./categories.service.js";
import { CategoriesRepository } from "./categories.repository.js";

describe("CategoriesService", () => {
    let service: CategoriesService;

    const repositoryMock = {
        getStore: vi.fn(),
        findCategoryBySlug: vi.fn(),
        findCategoryById: vi.fn(),
        findCategoryByIdWithProducts: vi.fn(),
        findManyByStoreWithCount: vi.fn(),
        createCategory: vi.fn(),
        updateCategory: vi.fn(),
        deleteCategory: vi.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CategoriesService,
                {
                    provide: CategoriesRepository,
                    useValue: repositoryMock,
                },
            ],
        }).compile();

        service = module.get<CategoriesService>(CategoriesService);
        vi.clearAllMocks();
    });

    // Test 1: IDOR Protection
    it("throws ForbiddenException when user does not own the store", async () => {
        repositoryMock.getStore.mockResolvedValue({ id: 1, ownerUserId: 99 }); // belongs to user 99

        await expect(
            service.createCategory(1, 10, { name: "Bakery", slug: "bakery" }) // called by user 10
        ).rejects.toThrow(ForbiddenException);
    });

    it("throws BadRequestException when previous category already exists", async () => {
        repositoryMock.getStore.mockResolvedValue({ id: 1, ownerUserId: 10 });
        repositoryMock.findCategoryBySlug.mockResolvedValue({ id: 2, name: "bakery", slug: "bakery" });

        await expect(
            service.createCategory(1, 10, { name: "Bakery", slug: "bakery" })
        ).rejects.toThrow(BadRequestException);
    })

    it("should update a category when inputs are valid", async () => {
        repositoryMock.getStore.mockResolvedValue({id:1, ownerUserId:10});
        repositoryMock.findCategoryById.mockResolvedValue({id:1, name: "Old bakery", slug: "bakery" });
        repositoryMock.findCategoryBySlug.mockResolvedValue(null);
        
        const updatedCategory = {
            id: 1, name:"New pastries", slug:"pastries"
        }

        repositoryMock.updateCategory.mockResolvedValue(updatedCategory)

        const result = await service.updateCategory(1, 10, 1, {name:"New pastries", slug:"pastries"})

        expect(result).toEqual(updatedCategory);
    })
});
