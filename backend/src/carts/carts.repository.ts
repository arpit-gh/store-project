import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";

@Injectable()
export class CartsRepository {
    constructor(private readonly prisma: PrismaService) {}

    // Find active cart for customer with all items and product inventory
    async findCartByCustomer(storeId: number, customerId: number) {
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
                    orderBy: {
                        createdAt: "desc",
                    },
                },
            },
        });
    }

    // Create a new cart for a customer in a store
    async createCart(storeId: number, customerId: number) {
        return await this.prisma.cart.create({
            data: {
                storeId,
                customerId,
            },
            include: {
                cartItems: true,
            },
        });
    }

    // Find a product and its available inventory in this store
    async findProductWithInventory(storeId: number, productId: number) {
        return await this.prisma.product.findFirst({
            where: {
                id: productId,
                storeId,
            },
            include: {
                inventories: true,
            },
        });
    }

    // Find an existing item in the cart by cartId and productId
    async findCartItem(cartId: number, productId: number) {
        return await this.prisma.cartItem.findUnique({
            where: {
                cartId_productId: {
                    cartId,
                    productId,
                },
            },
        });
    }

    // Find a cart item by its primary key ID
    async findCartItemById(cartItemId: number) {
        return await this.prisma.cartItem.findUnique({
            where: { id: cartItemId },
            include: {
                cart: true,
                product: {
                    include: {
                        inventories: true,
                    },
                },
            },
        });
    }

    // Add a new item to cart
    async createCartItem(cartId: number, productId: number, quantity: number, unitPrice: number) {
        return await this.prisma.cartItem.create({
            data: {
                cartId,
                productId,
                quantity,
                unitPrice,
            },
        });
    }

    // Update quantity of an existing cart item
    async updateCartItemQuantity(cartItemId: number, quantity: number) {
        return await this.prisma.cartItem.update({
            where: { id: cartItemId },
            data: { quantity },
        });
    }

    // Remove a single item from cart
    async deleteCartItem(cartItemId: number) {
        return await this.prisma.cartItem.delete({
            where: { id: cartItemId },
        });
    }

    // Clear all items in cart
    async clearCart(cartId: number) {
        return await this.prisma.cartItem.deleteMany({
            where: { cartId },
        });
    }
}
