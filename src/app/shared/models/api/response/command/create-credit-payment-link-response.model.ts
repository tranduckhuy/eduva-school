export interface CreateCreditPaymentLinkResponse {
  checkoutUrl: string;
  paymentLinkId: string;
  amount: number;
  transactionCode: string;
}
