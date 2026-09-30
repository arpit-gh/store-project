export type ProcessPaymentInput = {
    orderId: number;
    amount: number;
    method: string; // e.g. "CARD", "UPI", "NETBANKING"
    currency?: string;
};
