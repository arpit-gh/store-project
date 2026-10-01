import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { OrdersRepository } from "./orders.repository.js";
import { FullfillmentType, OrderStatus, ProductStatus } from "../../generated/prisma/enums.js";

export type CheckoutInput = {
    fulfillmentType: FullfillmentType;
    deliveryAddress?: string;
};

@Injectable()
export class OrdersService {
    constructor(private readonly ordersRepository: OrdersRepository) {}

    // Rote plumbing: Store owner views all orders for their store
    async getStoreOrders(storeId: number, userId: number, limit = 20, offset = 0) {
        const store = await this.ordersRepository.getStore(storeId);
        if (!store) {
            throw new NotFoundException("Store not found");
        }
        if (store.ownerUserId !== userId) {
            throw new ForbiddenException("You are not authorized to view orders for this store");
        }

        return await this.ordersRepository.findOrdersByStore(storeId, limit, offset);
    }

    // Rote plumbing: Customer views their past order history in this store
    async getCustomerOrders(storeId: number, customerId: number, limit = 20, offset = 0) {
        return await this.ordersRepository.findOrdersByCustomer(storeId, customerId, limit, offset);
    }

    // Rote plumbing: Get single order with security gate (either merchant or the customer)
    async getOrderById(
        storeId: number,
        orderId: number,
        caller: { customerId?: number; userId?: number },
    ) {
        const order = await this.ordersRepository.findOrderById(storeId, orderId);
        if (!order) {
            throw new NotFoundException("Order not found");
        }

        // If customer is accessing: verify it is their own order
        if (caller.customerId && order.customerId !== caller.customerId) {
            throw new ForbiddenException("You cannot view another customer's order");
        }

        // If merchant is accessing: verify they own the store
        if (caller.userId) {
            const store = await this.ordersRepository.getStore(storeId);
            if (!store || store.ownerUserId !== caller.userId) {
                throw new ForbiddenException("You are not the owner of this store");
            }
        }

        return order;
    }

    // --- Decision-Heavy / The Checkout Engine Transaction Below ---

    async checkout(storeId: number, customerId: number, input: CheckoutInput) {

        const store = await this.ordersRepository.getStore(storeId);
        if (!store) {
            throw new NotFoundException("Store not found");
        }

        if(input.fulfillmentType === FullfillmentType.DELIVERY && !store.allowsDelivery) {
            throw new BadRequestException("Store does not allow delivery");
        }

        if(input.fulfillmentType === FullfillmentType.PICKUP && !store.allowsPickup) {
            throw new BadRequestException("Store does not allow pickup");
        }

        const customer = await this.ordersRepository.findCustomer(storeId, customerId);
        if (!customer) {
            throw new NotFoundException("Customer not found");
        }

        if(input.fulfillmentType === FullfillmentType.DELIVERY && !input.deliveryAddress && !customer.address) {
            throw new BadRequestException("Delivery address is required");
        }

        const cart = await this.ordersRepository.findCartWithItems(storeId, customerId);
        if (!cart || cart.cartItems.length === 0) {
            throw new BadRequestException("Cart is empty");
        }

        const cartItems = cart.cartItems;
        
        return await this.ordersRepository.client.$transaction(async(tx) => {
            for(const cartItem of cartItems) {
                if(cartItem.product.status !== ProductStatus.ACTIVE) {
                    throw new BadRequestException(`Product ${cartItem.product.name} is not active`);
                }
                const availableStock = cartItem.product.inventories?.stockCount ?? 0;
                if(cartItem.quantity > availableStock) {
                    throw new BadRequestException(`Insufficient stock for product ${cartItem.product.name}`);
                }

                const result = await tx.inventory.updateMany({
                    where: {
                        productId: cartItem.productId,
                        stockCount: { gte: cartItem.quantity },
                    },
                    data: {
                        stockCount: { decrement: cartItem.quantity },
                    },
                });

                if(result.count === 0) {
                    throw new BadRequestException(`Insufficient stock for product ${cartItem.product.name}`);
                }

            }

            const totalAmount = cartItems.reduce((acc, item)=>{
                return acc + item.quantity * Number(item.unitPrice);
            }, 0);

            const resolvedAddress = input.deliveryAddress ?? customer.address;

            const order = await tx.order.create({
                data: {
                        storeId,
                        customerId,
                        status: OrderStatus.PENDING,
                        fulfillmentType: input.fulfillmentType,
                        totalAmount,
                        currency: cart.cartItems[0]?.product.currency ?? "INR",
                        deliveryAddressSnapshot: input.fulfillmentType === FullfillmentType.DELIVERY ? resolvedAddress : null,
                        orderItems: {
                            create: cartItems.map((item) => ({
                                productId: item.productId,
                                quantity: item.quantity,
                                priceAtPurchase: item.unitPrice,
                            })),
                        },
                    },
                    include: {
                        orderItems: true,
                    },
                });

            await tx.cartItem.deleteMany({
                where :{ cartId : cart.id }
            })

            return order;
        });
 
    }
}
