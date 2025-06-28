export interface CreatePlanPaymentLinkResponse {
  checkoutUrl: string;
  paymentLinkId: string;
  amount: number;
  deductedAmount: number;
  transactionCode: string;
  deductedPercent: number;
}
