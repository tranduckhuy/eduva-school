export interface CreditTransactionDetail {
  id: string;
  credits: number;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
  };
  aiCreditPack: {
    id: number;
    name: string;
    price: number;
    credits: number;
    bonusCredits: number;
  };
  paymentTransactionId: string;
}
