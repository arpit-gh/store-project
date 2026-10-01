import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { PaymentsService } from "./payments.service.js";
import { PaymentsRepository } from "./payments.repository.js";
import { PAYMENT_GATEWAY } from "./interfaces/payment-gateway.interface.js";
import { OrderStatus, PaymentStatus } from "../../generated/prisma/enums.js";

describe("PaymentsService - processPayment", () => {
    let service: PaymentsService;

    const txMock = {
        payment: {
            create: vi.fn(),
        },
        order: {
            update: vi.fn(),
        },
    };

    const repositoryMock = {
        findOrderById: vi.fn(),
        findPaymentById: vi.fn(),
        findPaymentsByOrder: vi.fn(),
        client: {
            $transaction: vi.fn(async (callback) => await callback(txMock)),
        },
    };

    const gatewayMock = {
        charge: vi.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PaymentsService,
                {
                    provide: PaymentsRepository,
                    useValue: repositoryMock,
                },
                {
                    provide: PAYMENT_GATEWAY,
                    useValue: gatewayMock,
                },
            ],
        }).compile();

        service = module.get<PaymentsService>(PaymentsService);
        vi.clearAllMocks();
    });

    it("should throw NotFoundException if order does not exist", async () => {
        repositoryMock.findOrderById.mockResolvedValue(null);

        await expect(
            service.processPayment(1, 10, {
                orderId: 999,
                amount: 500,
                method: "CARD",
            }),
        ).rejects.toThrow(NotFoundException);
    });

    it("should throw BadRequestException if customer is not the owner of the order", async () => {
        repositoryMock.findOrderById.mockResolvedValue({
            id: 1,
            storeId: 1,
            customerId: 20, // different customer
            status: OrderStatus.PENDING,
            totalAmount: 500,
        });

        await expect(
            service.processPayment(1, 10, {
                orderId: 1,
                amount: 500,
                method: "CARD",
            }),
        ).rejects.toThrow(BadRequestException);
    });

    it("should throw ForbiddenException if order is not in PENDING status", async () => {
        repositoryMock.findOrderById.mockResolvedValue({
            id: 1,
            storeId: 1,
            customerId: 10,
            status: OrderStatus.CONFIRMED, // already confirmed
            totalAmount: 500,
        });

        await expect(
            service.processPayment(1, 10, {
                orderId: 1,
                amount: 500,
                method: "CARD",
            }),
        ).rejects.toThrow(ForbiddenException);
    });

    it("should throw BadRequestException if payment amount does not match order total", async () => {
        repositoryMock.findOrderById.mockResolvedValue({
            id: 1,
            storeId: 1,
            customerId: 10,
            status: OrderStatus.PENDING,
            totalAmount: 500,
        });

        await expect(
            service.processPayment(1, 10, {
                orderId: 1,
                amount: 400, // mismatch
                method: "CARD",
            }),
        ).rejects.toThrow(BadRequestException);
    });

    it("should successfully process payment, record SUCCEEDED payment, and update order to CONFIRMED", async () => {
        const mockOrder = {
            id: 1,
            storeId: 1,
            customerId: 10,
            status: OrderStatus.PENDING,
            totalAmount: 500,
            currency: "INR",
        };
        repositoryMock.findOrderById.mockResolvedValue(mockOrder);

        gatewayMock.charge.mockResolvedValue({
            success: true,
            provider: "MOCK",
            providerPaymentId: "mock_pay_123",
        });

        const createdPayment = {
            id: 100,
            orderId: 1,
            provider: "MOCK",
            providerPaymentId: "mock_pay_123",
            amount: 500,
            currency: "INR",
            method: "CARD",
            status: PaymentStatus.SUCCEEDED,
        };
        txMock.payment.create.mockResolvedValue(createdPayment);
        txMock.order.update.mockResolvedValue({ ...mockOrder, status: OrderStatus.CONFIRMED });

        const result = await service.processPayment(1, 10, {
            orderId: 1,
            amount: 500,
            method: "CARD",
        });

        expect(result.success).toBe(true);
        expect(result.orderStatus).toBe(OrderStatus.CONFIRMED);
        expect(result.payment).toEqual(createdPayment);

        // Verify gateway was called with metadata
        expect(gatewayMock.charge).toHaveBeenCalledWith({
            orderId: 1,
            amount: 500,
            currency: "INR",
            method: "CARD",
            metadata: {
                storeId: 1,
                customerId: 10,
                orderId: 1,
            },
        });

        // Verify atomic DB updates
        expect(txMock.payment.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                orderId: 1,
                status: PaymentStatus.SUCCEEDED,
            }),
        });
        expect(txMock.order.update).toHaveBeenCalledWith({
            where: { id: 1 },
            data: { status: OrderStatus.CONFIRMED },
        });
    });

    it("should record FAILED payment and keep order as PENDING if gateway charge fails", async () => {
        const mockOrder = {
            id: 1,
            storeId: 1,
            customerId: 10,
            status: OrderStatus.PENDING,
            totalAmount: 500,
            currency: "INR",
        };
        repositoryMock.findOrderById.mockResolvedValue(mockOrder);

        gatewayMock.charge.mockResolvedValue({
            success: false,
            provider: "MOCK",
            failureReason: "Card declined",
        });

        const createdPayment = {
            id: 101,
            orderId: 1,
            provider: "MOCK",
            providerPaymentId: null,
            amount: 500,
            currency: "INR",
            method: "CARD",
            status: PaymentStatus.FAILED,
        };
        txMock.payment.create.mockResolvedValue(createdPayment);

        const result = await service.processPayment(1, 10, {
            orderId: 1,
            amount: 500,
            method: "CARD",
        });

        expect(result.success).toBe(false);
        expect(result.failureReason).toBe("Card declined");
        expect(result.orderStatus).toBe(OrderStatus.PENDING);

        // Verify order status was NOT updated to CONFIRMED
        expect(txMock.order.update).not.toHaveBeenCalled();

        // Verify failed payment row was saved for audit trail
        expect(txMock.payment.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                orderId: 1,
                status: PaymentStatus.FAILED,
            }),
        });
    });
});
