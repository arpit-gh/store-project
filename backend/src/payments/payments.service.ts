import {
    BadRequestException,
    ForbiddenException,
    Inject,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { PaymentsRepository } from "./payments.repository.js";
import { PAYMENT_GATEWAY, type PaymentGateway } from "./interfaces/payment-gateway.interface.js";
import type { ProcessPaymentInput } from "./dto/process-payment.dto.js";
import { OrderStatus, PaymentStatus } from "../../generated/prisma/enums.js";

@Injectable()
export class PaymentsService {
    constructor(
        private readonly paymentsRepository: PaymentsRepository,
        @Inject(PAYMENT_GATEWAY) private readonly gateway: PaymentGateway,
    ) {}

    // Rote plumbing: View a specific payment details
    async getPaymentById(
        storeId: number,
        paymentId: number,
        caller: { customerId?: number; userId?: number },
    ) {
        const payment = await this.paymentsRepository.findPaymentById(paymentId);
        if (!payment || payment.order.storeId !== storeId) {
            throw new NotFoundException("Payment not found");
        }

        // Authorization: customer can only view payments for their own orders
        if (caller.customerId && payment.order.customerId !== caller.customerId) {
            throw new ForbiddenException("You cannot view this payment");
        }

        return payment;
    }

    // Rote plumbing: View all payment attempts for an order
    async getOrderPayments(
        storeId: number,
        orderId: number,
        caller: { customerId?: number; userId?: number },
    ) {
        const order = await this.paymentsRepository.findOrderById(storeId, orderId);
        if (!order) {
            throw new NotFoundException("Order not found");
        }

        if (caller.customerId && order.customerId !== caller.customerId) {
            throw new ForbiddenException("You cannot view payments for this order");
        }

        return await this.paymentsRepository.findPaymentsByOrder(orderId);
    }

    async processPayment(
        storeId: number,
        customerId: number,
        input: ProcessPaymentInput,
    ) {
        const order = await this.paymentsRepository.findOrderById(storeId, input.orderId)

        if(!order ){
            throw new NotFoundException("Invalid order")
        }

        if(order.customerId !== customerId){
            throw new BadRequestException("Not authorized to pay for this order")
        }

        if(order.status !== OrderStatus.PENDING){
            throw new ForbiddenException("Can't pay for order now")
        } 

        if (Number(input.amount) !== Number(order.totalAmount)) {
            throw new BadRequestException("Order amount doesn't match");
        }

        const res = await this.gateway.charge({
            orderId: order.id,
            amount: input.amount,
            currency: input.currency ?? order.currency,
            method: input.method,
            metadata: {
                storeId,
                customerId,
                orderId: order.id,
            },
        });

        
        return await this.paymentsRepository.client.$transaction(async (tx) => {
            const payment = await tx.payment.create({
                data: {
                    orderId: order.id,
                    provider: res.provider,
                    providerPaymentId: res.providerPaymentId ?? null,
                    amount: input.amount,
                    currency: input.currency ?? order.currency,
                    method: input.method,
                    status: res.success ? PaymentStatus.SUCCEEDED : PaymentStatus.FAILED,
                },
            });

            if (res.success) {
                await tx.order.update({
                    where: { id: order.id },
                    data: {
                        status: OrderStatus.CONFIRMED,
                    },
                });
            }

           
            return {
                payment,
                orderStatus: res.success ? OrderStatus.CONFIRMED : order.status,
                success: res.success,
                failureReason: res.failureReason,
            };
        });

        
    }
}
