import { Module } from "@nestjs/common";
import { PaymentsController } from "./payments.controller.js";
import { PaymentsService } from "./payments.service.js";
import { PaymentsRepository } from "./payments.repository.js";
import { PAYMENT_GATEWAY } from "./interfaces/payment-gateway.interface.js";
import { MockPaymentGateway } from "./gateways/mock-payment.gateway.js";

@Module({
    controllers: [PaymentsController],
    providers: [
        PaymentsRepository,
        PaymentsService,
        {
            provide: PAYMENT_GATEWAY,
            useClass: MockPaymentGateway,
        },
    ],
    exports: [PaymentsService, PaymentsRepository],
})
export class PaymentsModule {}
