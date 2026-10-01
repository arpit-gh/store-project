import { Body, Controller, Get, Headers, Param, Post } from "@nestjs/common";
import { PaymentsService } from "./payments.service.js";
import type { ProcessPaymentInput } from "./dto/process-payment.dto.js";

@Controller("stores/:storeId")
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) {}

    // Shopper submits a payment for their pending order
    @Post("payments")
    processPayment(
        @Param("storeId") storeId: string,
        @Headers("x-customer-id") customerId: string,
        @Body() body: ProcessPaymentInput,
    ) {
        const currentCustomerId = customerId ? Number(customerId) : 1;
        return this.paymentsService.processPayment(
            Number(storeId),
            currentCustomerId,
            body,
        );
    }

    // Inspect a specific payment attempt
    @Get("payments/:paymentId")
    getPaymentById(
        @Param("storeId") storeId: string,
        @Param("paymentId") paymentId: string,
        @Headers("x-customer-id") customerId?: string,
        @Headers("x-user-id") userId?: string,
    ) {
        return this.paymentsService.getPaymentById(
            Number(storeId),
            Number(paymentId),
            {
                customerId: customerId ? Number(customerId) : undefined,
                userId: userId ? Number(userId) : undefined,
            },
        );
    }

    // Inspect all payment attempts for a given order
    @Get("orders/:orderId/payments")
    getOrderPayments(
        @Param("storeId") storeId: string,
        @Param("orderId") orderId: string,
        @Headers("x-customer-id") customerId?: string,
        @Headers("x-user-id") userId?: string,
    ) {
        return this.paymentsService.getOrderPayments(
            Number(storeId),
            Number(orderId),
            {
                customerId: customerId ? Number(customerId) : undefined,
                userId: userId ? Number(userId) : undefined,
            },
        );
    }
}
