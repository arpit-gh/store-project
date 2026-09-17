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

        let cart = await this.cartsRepository.findCartByCustomer(storeId, customerId)
        if(!cart){
            await this.cartsRepository.createCart(storeId, customerId)
            cart = await this.cartsRepository.findCartByCustomer(storeId,customerId)
        }
        
        const existingItem = await this.cartsRepository.findCartItem(cart!.id, input.productId)

        const desiredQuantity = (existingItem?.quantity ?? 0 ) + input.quantity

        const availableStock = product.inventories?.stockCount ?? 0
        if(desiredQuantity > availableStock){
            throw new BadRequestException(`Insufficient stock, only ${availableStock} remaining.`)
        }

        if(existingItem){
            await this.cartsRepository.updateCartItemQuantity(existingItem.id, desiredQuantity)
        }else{
            await this.cartsRepository.createCartItem(cart!.id, input.productId, input.quantity, Number(product.price))
        }

        return await this.getOrCreateCart(storeId, customerId)
    }

    async updateItemQuantity(storeId: number, customerId: number, cartItemId: number, quantity: number) {
        const item = await this.cartsRepository.findCartItemById(cartItemId)
        if(!item){
            throw new NotFoundException("Item not found.")
        }
        if(item.cart.storeId !== storeId || item.cart.customerId !== customerId){
            throw new ForbiddenException("You don't have permission to update this cart item.")
        }

        if(quantity <= 0){
            await this.cartsRepository.deleteCartItem(cartItemId)
            return await this.getOrCreateCart(storeId, customerId)
        }
        
        const availableStock = item.product.inventories?.stockCount ?? 0
        if(quantity > availableStock){
            throw new BadRequestException(`Insufficient stock, only ${availableStock} remaining.`)
        }

        await this.cartsRepository.updateCartItemQuantity(cartItemId, quantity)

        return await this.getOrCreateCart(storeId, customerId)
    }

    async removeItem(storeId: number, customerId: number, cartItemId: number) {
        const item = await this.cartsRepository.findCartItemById(cartItemId)
        if(!item){
            throw new NotFoundException("Item not found.")
        }
        if(item.cart.storeId !== storeId || item.cart.customerId !== customerId){
            throw new ForbiddenException("You don't have permission to remove this cart item.")
        }
        await this.cartsRepository.deleteCartItem(cartItemId)
        return await this.getOrCreateCart(storeId, customerId)
    }

    async clearCart(storeId: number, customerId: number) {
        const cart = await this.getOrCreateCart(storeId, customerId);
        await this.cartsRepository.clearCart(cart.id);
        return await this.getOrCreateCart(storeId, customerId);
    }
}
