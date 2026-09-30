import { Injectable } from "@nestjs/common";
import type { PaymentGateway, ChargeParams, ChargeResult } from "../interfaces/payment-gateway.interface.js";
import { randomUUID } from "node:crypto";

@Injectable()
export class MockPaymentGateway implements PaymentGateway {
    async charge(params: ChargeParams): Promise<ChargeResult> {
        // Allows testing failure scenarios deterministically by passing method "FAIL_TEST"
        if (params.method === "FAIL_TEST") {
            return {
                success: false,
                provider: "MOCK",
                failureReason: "Card declined by test mock provider",
            };
        }

        return {
            success: true,
            provider: "MOCK",
            providerPaymentId: `mock_pay_${randomUUID().substring(0, 8)}`,
        };
    }
}
