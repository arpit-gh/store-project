export type ChargeParams = {
    orderId: number;
    amount: number;
    currency: string;
    method: string;
    metadata?: Record<string, any>;
};

export type ChargeResult = {
    success: boolean;
    provider: string;
    providerPaymentId?: string;
    failureReason?: string;
};

export interface PaymentGateway {
    charge(params: ChargeParams): Promise<ChargeResult>;
}

export const PAYMENT_GATEWAY = "PAYMENT_GATEWAY";
