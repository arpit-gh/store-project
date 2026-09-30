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

    // =========================================================================
    // Core Decision-Heavy Business Logic: To Be Hand-Written By You!
    // =========================================================================
    async processPayment(
        storeId: number,
        customerId: number,
        input: ProcessPaymentInput,
    ) {
        // Step 1: Fetch order & verify customer ownership
        // Step 2: Guard against paying for an already confirmed order (or cancelled)
        // Step 3: Guard that input.amount matches order.totalAmount
        // Step 4: Delegate charge to this.gateway.charge(...)
        // Step 5: Inside an atomic this.paymentsRepository.client.$transaction:
        //         - Record payment with status SUCCEEDED / FAILED
        //         - If SUCCEEDED: Update order status to CONFIRMED
        // Step 6: Return payment and updated status
        throw new Error("Not implemented yet");
    }
}
