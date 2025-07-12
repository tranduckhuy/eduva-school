import { PaymentStatus } from '../../../../shared/models/entities/payment.model';

export interface CreditTransactionDetail {
  id: string;
  totalCredits: number;
  createdAt: string;
  paymentStatus: PaymentStatus;
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
  transactionCode: string;
  amount: number;
  paymentTransactionId: string;
}
