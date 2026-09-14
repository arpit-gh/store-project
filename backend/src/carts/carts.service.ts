import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { CartsRepository } from "./carts.repository.js";
import { ProductStatus } from "../../generated/prisma/enums.js";

export type AddCartItemInput = {
    productId: number;
    quantity: number;
};

export type UpdateCartItemInput = {
    quantity: number;
};

@Injectable()
export class CartsService {
    constructor(private readonly cartsRepository: CartsRepository) {}

    // Rote plumbing: Get active cart for customer or create one if none exists, with computed totals
    async getOrCreateCart(storeId: number, customerId: number) {
        let cart = await this.cartsRepository.findCartByCustomer(storeId, customerId);

        if (!cart) {
            await this.cartsRepository.createCart(storeId, customerId);
            cart = await this.cartsRepository.findCartByCustomer(storeId, customerId);
        }

        if (!cart) {
            throw new NotFoundException("Cart could not be found or created");
        }

        const items = cart.cartItems;

        // Compute subtotal and total item count
        const subtotal = items.reduce((acc, item) => {
            return acc + Number(item.unitPrice) * item.quantity;
        }, 0);

        const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

        return {
            ...cart,
            subtotal,
            totalItems,
        };
    }

    // --- Decision-Heavy Methods Below (E-Commerce Cart Rules) ---

    async addItemToCart(storeId: number, customerId: number, input: AddCartItemInput) {
        if(input.quantity <= 0){
            throw new BadRequestException("Quantity must be greater than 0.")
        }

        const product = await this.cartsRepository.findProductWithInventory(storeId,input.productId)
        if(!product){
            throw new NotFoundException("Product not found.")
        }
        if(product.status !== ProductStatus.ACTIVE){
            throw new BadRequestException("Product is not active.")
        }
        // 3. Check existing cartItem (findCartItem) to calculate total desired quantity:
        //    desiredQuantity = (existingItem?.quantity ?? 0) + input.quantity
        let cart = await this.cartsRepository.findCartByCustomer(storeId, customerId)
        if(!cart){
            await this.cartsRepository.createCart(storeId, customerId)
            cart = await this.cartsRepository.findCartByCustomer(storeId,customerId)
        }
        
        const existingItem = await this.cartsRepository.findCartItem(cart!.id, input.productId)

        const desiredQuantity = (existingItem?.quantity ?? 0 ) + input.quantity
        // 4. Stock check: availableStock = product.inventories?.stockCount ?? 0
        //    If desiredQuantity > availableStock -> 400 "Insufficient stock"

        const availableStock = product.inventories?.stockCount ?? 0
        if(desiredQuantity > availableStock){
            throw new BadRequestException("Insufficient stock.")
        }

        
        // 5. If item exists: updateCartItemQuantity
        //    If item is new: createCartItem with unitPrice = Number(product.price)
        // 6. Return refreshed cart with totals
    }

    async updateItemQuantity(storeId: number, customerId: number, cartItemId: number, quantity: number) {
        // TODO: Challenge 2 for user:
        // 1. Fetch cart item via findCartItemById(cartItemId) (404 if not found)
        // 2. Multi-tenant Cart Ownership check:
        //    Verify cartItem.cart.storeId === storeId AND cartItem.cart.customerId === customerId (403/404)
        // 3. If quantity <= 0: deleteCartItem and return refreshed cart
        // 4. If quantity > 0:
        //    - Check stock: availableStock = cartItem.product.inventories?.stockCount ?? 0
        //    - If quantity > availableStock -> 400 "Insufficient stock"
        //    - Update quantity
        // 5. Return refreshed cart with totals
    }

    async removeItem(storeId: number, customerId: number, cartItemId: number) {
        // TODO: Challenge 3 for user:
        // 1. Fetch cart item via findCartItemById(cartItemId) (404)
        // 2. Verify ownership (storeId & customerId match)
        // 3. Delete cart item
        // 4. Return refreshed cart with totals
    }

    async clearCart(storeId: number, customerId: number) {
        const cart = await this.getOrCreateCart(storeId, customerId);
        await this.cartsRepository.clearCart(cart.id);
        return await this.getOrCreateCart(storeId, customerId);
    }
}
