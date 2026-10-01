import { Body, Controller, Delete, Get, Headers, Param, Patch, Post } from "@nestjs/common";
import { CartsService, type AddCartItemInput, type UpdateCartItemInput } from "./carts.service.js";

@Controller("stores/:storeId/cart")
export class CartsController {
    constructor(private readonly cartsService: CartsService) {}

    // Get active cart
    @Get()
    getCart(
        @Param("storeId") storeId: string,
        @Headers("x-customer-id") customerId: string,
    ) {
        const currentCustomerId = customerId ? Number(customerId) : 1;
        return this.cartsService.getOrCreateCart(Number(storeId), currentCustomerId);
    }

    // Add item to cart
    @Post("items")
    addItem(
        @Param("storeId") storeId: string,
        @Headers("x-customer-id") customerId: string,
        @Body() body: AddCartItemInput,
    ) {
        const currentCustomerId = customerId ? Number(customerId) : 1;
        return this.cartsService.addItemToCart(Number(storeId), currentCustomerId, body);
    }

    // Update item quantity
    @Patch("items/:itemId")
    updateQuantity(
        @Param("storeId") storeId: string,
        @Param("itemId") itemId: string,
        @Headers("x-customer-id") customerId: string,
        @Body() body: UpdateCartItemInput,
    ) {
        const currentCustomerId = customerId ? Number(customerId) : 1;
        return this.cartsService.updateItemQuantity(
            Number(storeId),
            currentCustomerId,
            Number(itemId),
            body.quantity,
        );
    }

    // Remove single item from cart
    @Delete("items/:itemId")
    removeItem(
        @Param("storeId") storeId: string,
        @Param("itemId") itemId: string,
        @Headers("x-customer-id") customerId: string,
    ) {
        const currentCustomerId = customerId ? Number(customerId) : 1;
        return this.cartsService.removeItem(Number(storeId), currentCustomerId, Number(itemId));
    }

    // Clear all items in cart
    @Delete()
    clearCart(
        @Param("storeId") storeId: string,
        @Headers("x-customer-id") customerId: string,
    ) {
        const currentCustomerId = customerId ? Number(customerId) : 1;
        return this.cartsService.clearCart(Number(storeId), currentCustomerId);
    }
}
